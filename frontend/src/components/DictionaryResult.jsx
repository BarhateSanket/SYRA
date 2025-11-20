import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const DictionaryResult = ({ result, onClose }) => {
  if (!result || !result.data) {
    return null;
  }

  const { data, message } = result;

  // Handle definition results
  if (data.definitions) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Dictionary Results</span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.map((entry, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{entry.word}</h3>
                <Badge variant="secondary">{entry.functionalLabel}</Badge>
                {entry.pronunciation && (
                  <span className="text-sm text-gray-600">/{entry.pronunciation}/</span>
                )}
              </div>

              <div className="space-y-2">
                {entry.definitions.map((def, defIndex) => (
                  <div key={defIndex} className="text-sm text-gray-700">
                    <span className="font-medium">{defIndex + 1}.</span> {def}
                  </div>
                ))}
              </div>

              {entry.etymology && (
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Etymology:</strong> {entry.etymology}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Handle spell check results
  if (data.isCorrect !== undefined) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Spell Check Results</span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Word:</span>
              <span className="text-lg">{data.word}</span>
              <Badge variant={data.isCorrect ? "success" : "destructive"}>
                {data.isCorrect ? "Correct" : "Incorrect"}
              </Badge>
            </div>

            {!data.isCorrect && data.suggestions && data.suggestions.length > 0 && (
              <div>
                <span className="font-medium">Suggestions:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.suggestions.map((suggestion, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default DictionaryResult;