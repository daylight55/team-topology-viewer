import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Team Topology Viewer" },
    { name: "description", content: "Visualize and optimize team interactions" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Team Topology Viewer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Team Topologyに基づいた組織設計の可視化と最適化
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">チーム管理</h2>
              <p className="text-gray-600 mb-4">
                チームタイプの定義、メンバー管理、認知負荷の追跡
              </p>
              <Link
                to="/teams"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                チーム一覧へ
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">インタラクション</h2>
              <p className="text-gray-600 mb-4">
                チーム間の相互作用を定義・可視化
              </p>
              <Link
                to="/interactions"
                className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                インタラクション一覧へ
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">可視化</h2>
              <p className="text-gray-600 mb-4">
                組織構造をグラフで視覚的に確認
              </p>
              <Link
                to="/visualization"
                className="inline-block bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
              >
                可視化ページへ
              </Link>
            </div>
          </div>
          
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6">Team Topologyとは</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-left">
                <div className="w-12 h-12 bg-blue-500 rounded-full mb-3"></div>
                <h3 className="font-semibold mb-2">Stream-aligned Team</h3>
                <p className="text-sm text-gray-600">
                  価値の流れに沿って働くチーム
                </p>
              </div>
              <div className="text-left">
                <div className="w-12 h-12 bg-green-500 rounded-full mb-3"></div>
                <h3 className="font-semibold mb-2">Platform Team</h3>
                <p className="text-sm text-gray-600">
                  他チームの自律性を支援する基盤を提供
                </p>
              </div>
              <div className="text-left">
                <div className="w-12 h-12 bg-amber-500 rounded-full mb-3"></div>
                <h3 className="font-semibold mb-2">Enabling Team</h3>
                <p className="text-sm text-gray-600">
                  他チームの能力向上を支援
                </p>
              </div>
              <div className="text-left">
                <div className="w-12 h-12 bg-violet-500 rounded-full mb-3"></div>
                <h3 className="font-semibold mb-2">Complicated Subsystem Team</h3>
                <p className="text-sm text-gray-600">
                  複雑な専門領域を担当
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}