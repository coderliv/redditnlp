import { useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSubredditAnalysis, SubredditNLPAnalysis } from "../src/lib/api";
import { SubredditAvatar } from "../src/components/SubredditAvatar.tsx";

import Template from "./Template.tsx";
import WordEmbeddingsGraph from "../Components/WordEmbeddingsGraph.tsx";

export default function RedditPage() {
  const { name } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SubredditNLPAnalysis | null>(null);
  const [timeFilter, setTimeFilter] = useState("week");
  const [sortBy, setSortBy] = useState("top");
  const spinnerStyle = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
  };

  const renderGenerationTimeEstimatesTable = () => {
    return (
      <div className="overflow-x-auto mt-7 mb-0 flex items-center justify-center">
        <table className="table-auto border-collapse text-sm m-2.5">
          <thead>
            <tr>
              <th className="px-6 py-2 text-center text-left text-indigo-600">Time Filter</th>
              <th className="px-8 py-2 text-center text-left text-indigo-600">Approx Generation Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-1.5 text-center bg-gray-200">Week</td>
              <td className="px-4 py-1.5 text-center bg-gray-200">3-5 min</td>
            </tr>
            <tr>
              <td className="px-4 py-1.5 text-center">Month</td>
              <td className="px-4 py-1.5 text-center">5-7 min</td>
            </tr>
            <tr>
              <td className="px-4 py-1.5 text-center bg-gray-200">Year</td>
              <td className="px-4 py-1.5 text-center bg-gray-200">10 min</td>
            </tr>
            <tr>
              <td className="px-4 py-1.5 text-center">All Time</td>
              <td className="px-4 py-1.5 text-center">15 min</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const renderWordEmbeddings = () => {
    return (
    <div className="mt-10 p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h1 className="font-semibold text-l p-1">
        Word Embeddings
      </h1>
      <p className="text-gray-500 p-3">
        Word embeddings are vector representations of words in high-dimensional space, offering insights into meaning and context.
        Below is a 2D projection of the most popular words in the subreddit (reduced via PCA).</p>
        <div className="bg-gray-100 rounded">
          <WordEmbeddingsGraph embeddings={[
            { word: 'hello', x: 1.2, y: 3.4 },
            { word: 'how', x: 2.5, y: 1.8 },
            {word: 'are', x: -1.1, y: -2.4 },
            { word: 'you', x: 0.7, y: -1.2 }
          ]}
          />
           </div>
          </div>
    );
  };

  const renderNGrams = () => {
    if (!analysis) return null;

    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Top N-Grams</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {Object.entries(analysis.top_n_grams).map(([date, ngrams]) => (
          <div key={date} className="mb-3 border bg-white border-gray-200 p-4 rounded-l shadow-md">
            <h3 className="text-lg font-semibold">{date}</h3>
            <ul className="list-disc pl-5">
              {ngrams.map((ngram, index) => (
                <li key={index}>
                  {ngram[0]}: {ngram[1]}
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </div>
    );
  };

  const renderNamedEntities = () => {
    if (!analysis) return null;
    return (
      <div className="mt-4">
        <h2 className="text-xl font-medium mb-2" style={{textAlign: 'center', fontSize: '20px'}}>Most Mentioned Named Entities</h2>
        <div style={{margin: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="w-[150px] h-[35px] font-medium" style={{fontSize: '15px', backgroundColor: ' #d9ead3', textAlign: 'center', padding: '5px', borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px' }}>Very Positive</div>
          <div className="w-[150px] h-[35px] font-medium" style={{fontSize: '15px', backgroundColor: ' #d0e0e3', textAlign: 'center', padding: '5px'}}>Positive</div>
          <div className="w-[150px] h-[35px] font-medium" style={{fontSize: '15px', backgroundColor: ' #fff2cc', textAlign: 'center', padding: '5px'}}>Neutral</div>
          <div className="w-[150px] h-[35px] font-medium" style={{fontSize: '15px', backgroundColor: ' #f4cccc', textAlign: 'center', padding: '5px'}}>Negative</div>
         <div className="w-[150px] h-[35px] font-medium" style={{fontSize: '15px', backgroundColor: ' #ea9999', textAlign: 'center', padding: '5px', borderTopRightRadius: '5px', borderBottomRightRadius: '5px' }}>Very Negative</div>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-1">
        {Object.entries(analysis.top_named_entities).map(([date, entities]) => (
          <div key={date} className="mb-6 mr-4 ml-4 border bg-white border-gray-300 rounded-l shadow-xl">
            <h3 className="text-lg font-semibold" style={{fontSize: '20px', textAlign: 'center', backgroundColor: '#efefef', padding: '4px'}}>{date}</h3>
            <ul className="list-decimal pl-5" >
              {entities.map((entity, index) => {
                const backgroundColor = entity[2] >= 0.5 && entity[2] <= 1 ? '#d9ead3':
                                        entity[2] >= 0.1 && entity[2] < 0.5 ? '#d0e0e3':
                                        entity[2] >= -0.1 && entity[2] < 0.1 ? '#fff2cc':
                                        entity[2] >= -0.5 && entity[2] < -0.1 ? '#f4cccc':
                                        entity[2] >= -1 && entity[2] < -0.5 ? '#ea9999' : "bg-gray-100";
                return (
                <li key={index} style={{margin:'20px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    backgroundColor: backgroundColor, paddingLeft: '10px', paddingRight: '10px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '5px'}}>
                    <span style={{ fontWeight: 600, fontSize: '15px'}}>{entity[0]}</span>
                    <span style={{ margin: "0 8px" }}>|</span>
                    <span style={{fontWeight: 600, fontSize: '15px'}}>Sentiment Score: {entity[2]}</span>
                    <span style={{ margin: "0 8px"}}>|</span>
                    <span style={{fontWeight: 600, fontSize: '15px'}}># of Mentions: {entity[1]}</span>
                  </div>
                  <div style = {{fontWeight: 600, fontSize: '13.5px', marginTop: '10px', marginBottom: '5px'}}>Summarized Sentiment: </div>
                  <div style = {{fontSize: '13.5px', color: '#333'}}>{entity[3]}</div>
                </li>
              );
            })}
            </ul>
          </div>
        ))}
      </div>
      </div>
    );
  };

  return (
    <Template>
      <div className="m-4 p-4 bg-white rounded-md">
        <div className="flex flex-col items-center mb-6">
          <SubredditAvatar subredditName={name ?? ""} />
          <h1 className="text-lg font-bold">r/{name}</h1>
        </div>
        <div className="flex gap-25 justify-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Time Filter</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="mt-1 block w-full px-1 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Time</option>
                <option value="year">Year</option>
                <option value="month">Month</option>
                <option value="week">Week</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 block w-full px-1 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="top">Top</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>
            <button
            onClick={() => {
              setIsLoading(true);
              fetchSubredditAnalysis(name || "", timeFilter, sortBy)
                .then(data => {
                  setAnalysis(data);
                  setIsLoading(false);
                })
                .catch(err => {
                  setError(err instanceof Error ? err.message : "An unknown error occurred");
                  setIsLoading(false);
                });
            }}
            className="block self-end px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Analyze
          </button>
          </div>
        </div>
        {renderGenerationTimeEstimatesTable()}
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center space-x-2">
              <h2>Loading analysis</h2>
              <div className="spinner" style={spinnerStyle}></div> 
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error: {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && analysis && (
          <div className="mt-4">
            <hr className="my-4 border-t border-gray-300 mx-auto w-[97%]" />
            {renderNamedEntities()}
            {renderNGrams()}
          </div>
        )}
        {renderWordEmbeddings()}
      </div>
    </Template>
  );
}
