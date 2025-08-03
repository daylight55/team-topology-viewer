import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { apolloClient } from "~/lib/apollo-client";
import { CREATE_INTERACTION, GET_TEAMS } from "~/lib/queries";
import { INTERACTION_MODE_LABELS } from "~/types";
import type { Team } from "~/types";

// TODO: 実際の実装では認証から組織IDを取得
const MOCK_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000000";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_TEAMS,
      variables: { organizationId: MOCK_ORGANIZATION_ID },
    });
    
    return json({ teams: data.teams as Team[] });
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return json({ teams: [] });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const teamAId = formData.get("teamAId") as string;
  const teamBId = formData.get("teamBId") as string;
  const mode = formData.get("mode") as string;
  const intensity = formData.get("intensity") as string;
  const durationType = formData.get("durationType") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const purpose = formData.get("purpose") as string;
  const expectedOutcome = formData.get("expectedOutcome") as string;
  
  if (teamAId === teamBId) {
    return json({ error: "同じチーム同士のインタラクションは作成できません" }, { status: 400 });
  }
  
  try {
    await apolloClient.mutate({
      mutation: CREATE_INTERACTION,
      variables: {
        input: {
          teamAId,
          teamBId,
          mode,
          intensity: intensity || undefined,
          durationType,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          purpose: purpose || undefined,
          expectedOutcome: expectedOutcome || undefined,
        },
      },
    });
    
    return redirect("/interactions");
  } catch (error) {
    return json({ error: "インタラクションの作成に失敗しました" }, { status: 400 });
  }
};

export default function NewInteraction() {
  const { teams } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/interactions"
            className="text-green-500 hover:text-green-600 mb-4 inline-block"
          >
            ← インタラクション一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新しいインタラクションを作成</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {actionData.error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="teamAId" className="block text-sm font-medium text-gray-700 mb-2">
                  チーム A *
                </label>
                <select
                  id="teamAId"
                  name="teamAId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">選択してください</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="teamBId" className="block text-sm font-medium text-gray-700 mb-2">
                  チーム B *
                </label>
                <select
                  id="teamBId"
                  name="teamBId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">選択してください</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">
                インタラクションモード *
              </label>
              <select
                id="mode"
                name="mode"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">選択してください</option>
                {Object.entries(INTERACTION_MODE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-2">
                  強度
                </label>
                <select
                  id="intensity"
                  name="intensity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">選択してください</option>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="durationType" className="block text-sm font-medium text-gray-700 mb-2">
                  期間タイプ *
                </label>
                <select
                  id="durationType"
                  name="durationType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">選択してください</option>
                  <option value="temporary">一時的</option>
                  <option value="permanent">恒常的</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  開始日 *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  終了日
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                目的
              </label>
              <textarea
                id="purpose"
                name="purpose"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="expectedOutcome" className="block text-sm font-medium text-gray-700 mb-2">
                期待される成果
              </label>
              <textarea
                id="expectedOutcome"
                name="expectedOutcome"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <h3 className="font-medium text-green-900 mb-2">インタラクションモードの説明</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li><strong>Collaboration:</strong> 共同で作業を行う密接な協力関係（一時的であるべき）</li>
                <li><strong>X-as-a-Service:</strong> 明確なAPIや契約を通じたサービス提供関係</li>
                <li><strong>Facilitating:</strong> 他チームの能力向上を支援する関係</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link
                to="/interactions"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                インタラクションを作成
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}