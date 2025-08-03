import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { apolloClient } from "~/lib/apollo-client";
import { GET_TEAMS, GET_INTERACTIONS } from "~/lib/queries";
import { InteractionGraph } from "~/components/InteractionGraph";
import type { Team, Interaction } from "~/types";

// TODO: 実際の実装では認証から組織IDを取得
const MOCK_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000000";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const [teamsResponse, interactionsResponse] = await Promise.all([
      apolloClient.query({
        query: GET_TEAMS,
        variables: { organizationId: MOCK_ORGANIZATION_ID },
      }),
      apolloClient.query({
        query: GET_INTERACTIONS,
        variables: { active: true },
      }),
    ]);
    
    return json({
      teams: teamsResponse.data.teams as Team[],
      interactions: interactionsResponse.data.interactions as Interaction[],
    });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return json({ teams: [], interactions: [] });
  }
};

export default function Visualization() {
  const { teams, interactions } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">組織構造の可視化</h1>
              <p className="mt-2 text-gray-600">チーム間のインタラクションを視覚的に確認できます</p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/teams"
                className="text-blue-500 hover:text-blue-600"
              >
                チーム管理
              </Link>
              <Link
                to="/interactions"
                className="text-green-500 hover:text-green-600"
              >
                インタラクション管理
              </Link>
            </div>
          </div>
        </div>
        
        {teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">まだチームが登録されていません</p>
            <Link
              to="/teams/new"
              className="text-blue-500 hover:text-blue-600"
            >
              最初のチームを作成する
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">インタラクショングラフ</h2>
                <div className="text-sm text-gray-500">
                  チーム数: {teams.length} / アクティブなインタラクション: {interactions.length}
                </div>
              </div>
            </div>
            <InteractionGraph teams={teams} interactions={interactions} />
          </div>
        )}
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">インタラクションの健全性チェック</h2>
          <div className="space-y-3">
            {interactions
              .filter(i => i.mode === 'collaboration' && i.durationType === 'permanent')
              .map(interaction => (
                <div key={interaction.id} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-yellow-800">恒常的なCollaboration</p>
                    <p className="text-sm text-yellow-700">
                      {interaction.teamA?.name} ↔ {interaction.teamB?.name}: Collaborationは一時的であるべきです
                    </p>
                  </div>
                </div>
              ))}
            {interactions.filter(i => i.mode === 'collaboration' && i.durationType === 'permanent').length === 0 && (
              <p className="text-green-600">✓ すべてのインタラクションが健全な状態です</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}