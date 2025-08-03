import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { apolloClient } from "~/lib/apollo-client";
import { GET_INTERACTIONS } from "~/lib/queries";
import type { Interaction } from "~/types";
import { INTERACTION_MODE_LABELS } from "~/types";
import { format } from "date-fns";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const active = url.searchParams.get("active") === "true";
  
  try {
    const { data } = await apolloClient.query({
      query: GET_INTERACTIONS,
      variables: { active },
    });
    
    return json({ interactions: data.interactions as Interaction[], active });
  } catch (error) {
    console.error("Failed to fetch interactions:", error);
    return json({ interactions: [], active });
  }
};

export default function InteractionsIndex() {
  const { interactions, active } = useLoaderData<typeof loader>();
  
  const getInteractionModeColor = (mode: string) => {
    const colors = {
      collaboration: 'bg-purple-100 text-purple-800',
      x_as_a_service: 'bg-blue-100 text-blue-800',
      facilitating: 'bg-green-100 text-green-800',
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };
  
  const getIntensityIndicator = (intensity?: string) => {
    if (!intensity) return null;
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return (
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">強度:</span>
        <div className={`w-3 h-3 rounded-full ${colors[intensity as keyof typeof colors]}`}></div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">インタラクション一覧</h1>
            <p className="mt-2 text-gray-600">チーム間の相互作用を管理します</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => {
                    window.location.href = `/interactions?active=${e.target.checked}`;
                  }}
                  className="mr-2"
                />
                アクティブのみ表示
              </label>
            </div>
            <Link
              to="/interactions/new"
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
            >
              インタラクションを追加
            </Link>
          </div>
        </div>
        
        {interactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              {active ? "アクティブなインタラクションがありません" : "インタラクションがまだ定義されていません"}
            </p>
            <Link
              to="/interactions/new"
              className="mt-4 inline-block text-green-500 hover:text-green-600"
            >
              最初のインタラクションを作成する
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    チーム
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    モード
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    強度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    期間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    目的
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interactions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {interaction.teamA?.name || 'Team A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ↔ {interaction.teamB?.name || 'Team B'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getInteractionModeColor(interaction.mode)}`}>
                        {INTERACTION_MODE_LABELS[interaction.mode]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getIntensityIndicator(interaction.intensity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{format(new Date(interaction.startDate), 'yyyy/MM/dd')}</div>
                        {interaction.endDate && (
                          <div className="text-gray-500">
                            〜 {format(new Date(interaction.endDate), 'yyyy/MM/dd')}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {interaction.durationType === 'temporary' ? '一時的' : '恒常的'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <p className="truncate max-w-xs">
                        {interaction.purpose || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/interactions/${interaction.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}