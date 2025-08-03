import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { apolloClient } from "~/lib/apollo-client";
import { GET_TEAMS } from "~/lib/queries";
import type { Team } from "~/types";
import { TEAM_TYPE_LABELS } from "~/types";

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

export default function TeamsIndex() {
  const { teams } = useLoaderData<typeof loader>();
  
  const getTeamTypeColor = (type: string) => {
    const colors = {
      stream_aligned: 'bg-blue-100 text-blue-800',
      platform: 'bg-green-100 text-green-800',
      enabling: 'bg-amber-100 text-amber-800',
      complicated_subsystem: 'bg-violet-100 text-violet-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">チーム一覧</h1>
            <p className="mt-2 text-gray-600">組織内のチームを管理します</p>
          </div>
          <Link
            to="/teams/new"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            チームを追加
          </Link>
        </div>
        
        {teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">チームがまだ登録されていません</p>
            <Link
              to="/teams/new"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600"
            >
              最初のチームを作成する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {team.name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTeamTypeColor(team.type)}`}>
                      {TEAM_TYPE_LABELS[team.type]}
                    </span>
                  </div>
                  
                  {team.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500">
                        メンバー: {team.members.length}名
                      </span>
                      <span className="text-gray-500">
                        ドメイン: {team.domains.length}
                      </span>
                    </div>
                    {team.cognitiveLoad !== null && team.cognitiveLoad !== undefined && (
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">認知負荷:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${team.cognitiveLoad * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}