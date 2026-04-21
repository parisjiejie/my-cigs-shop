import dbConnect from '@/lib/dbConnect';
import Feedback from '@/lib/models/Feedback';
import FeedbackManager from '@/components/FeedbackManager';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage() {
  await dbConnect();
  // 序列化
  const items = await Feedback.find({}).sort({ createdAt: -1 }).lean();
  const formattedItems = items.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt.toISOString()
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Feedback & Changelog</h1>
        <p className="text-gray-500 mt-1">Track issues and automate version releases</p>
      </div>
      <FeedbackManager items={formattedItems} />
    </div>
  );
}