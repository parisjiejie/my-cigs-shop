import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Changelog from '@/lib/models/Changelog';
import Feedback from '@/lib/models/Feedback';

// 简单的版本号递增逻辑 (v1.0.0 -> v1.0.1)
function incrementVersion(version: string) {
  const parts = version.replace('v', '').split('.').map(Number);
  if (parts.length !== 3) return 'v1.0.1'; // 默认初始值
  parts[2] += 1; // 增加补丁版本号
  return `v${parts.join('.')}`;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    // 1. 寻找所有“已完成”但在“等待发布”的反馈
    const pendingFeedback = await Feedback.find({
      status: 'Completed',
      $or: [{ fixedInVersion: null }, { fixedInVersion: '' }]
    });

    if (pendingFeedback.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '没有找到待发布的已完成问题 (No completed feedback to release).' 
      });
    }

    // 2. 获取上一个版本号，计算新版本号
    const lastLog = await Changelog.findOne().sort({ releaseDate: -1 });
    const newVersion = lastLog ? incrementVersion(lastLog.version) : 'v1.0.0';

    // 3. 自动生成日志内容 (Markdown 格式列表)
    const contentList = pendingFeedback.map((f: any) => {
       // 格式：- [页面] 修复内容
       return `- [${f.pageName}] ${f.expectation || f.issue}`;
    });
    
    const autoContent = `
### 🚀 Release ${newVersion}
**更新时间**: ${new Date().toLocaleDateString()}

**更新内容**:
${contentList.join('\n')}
    `.trim();

    // 4. 创建新的 Changelog 记录
    const newChangelog = await Changelog.create({
      version: newVersion,
      content: autoContent,
      resolvedFeedbackIds: pendingFeedback.map((f: any) => f._id),
      releaseDate: new Date()
    });

    // 5. 批量反向更新 Feedback 表，标记它们已被此版本修复
    await Feedback.updateMany(
      { _id: { $in: pendingFeedback.map((f: any) => f._id) } },
      { $set: { fixedInVersion: newVersion } }
    );

    return NextResponse.json({ 
      success: true, 
      message: `版本 ${newVersion} 发布成功！包含 ${pendingFeedback.length} 项更新。`,
      changelog: newChangelog
    });

  } catch (error: any) {
    console.error('Auto-generate changelog failed:', error);
    return NextResponse.json({ error: 'System Error' }, { status: 500 });
  }
}