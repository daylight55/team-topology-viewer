import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { apolloClient } from "~/lib/apollo-client";
import { CREATE_TEAM } from "~/lib/queries";
import { TEAM_TYPE_LABELS } from "~/types";

// TODO: 実際の実装では認証から組織IDを取得
const MOCK_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000000";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const cognitiveLoad = formData.get("cognitiveLoad") as string;
  
  try {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_TEAM,
      variables: {
        input: {
          organizationId: MOCK_ORGANIZATION_ID,
          name,
          type,
          description: description || undefined,
          cognitiveLoad: cognitiveLoad ? parseFloat(cognitiveLoad) : undefined,
        },
      },
    });
    
    return redirect(`/teams/${data.createTeam.id}`);
  } catch (error) {
    return json({ error: "チームの作成に失敗しました" }, { status: 400 });
  }
};

export default function NewTeam() {
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/teams"
            className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
          >
            ← チーム一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新しいチームを作成</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {actionData.error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                チーム名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                チームタイプ *
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {Object.entries(TEAM_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="cognitiveLoad" className="block text-sm font-medium text-gray-700 mb-2">
                認知負荷 (0.0 - 1.0)
              </label>
              <input
                type="number"
                id="cognitiveLoad"
                name="cognitiveLoad"
                min="0"
                max="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">チームタイプの説明</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li><strong>Stream-aligned:</strong> 価値の流れに沿って働く、製品やサービスを担当するチーム</li>
                <li><strong>Platform:</strong> 他チームの自律性を高める内部サービスを提供するチーム</li>
                <li><strong>Enabling:</strong> 他チームの能力向上を支援する専門家チーム</li>
                <li><strong>Complicated Subsystem:</strong> 複雑な専門領域を担当するチーム</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link
                to="/teams"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                チームを作成
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}