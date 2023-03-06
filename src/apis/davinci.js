/**
 *
 * @param {Array} prompt
 * @param {InstanceType} openai
 * @returns {Promise} Promise object represents response of gpt
 */
export async function generateText(prompt, openai, promptWithHistory) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: promptWithHistory.concat(prompt).join("\n") + "?",
    temperature: 0.5,
    max_tokens: 500,
    top_p: 0.5,
    frequency_penalty: 0.5,
    presence_penalty: 0.2,
    stop: [" Human:", " AI:"],
  });

  return response;
}
