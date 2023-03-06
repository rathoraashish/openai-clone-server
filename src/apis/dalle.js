/**
 *
 * @param {string} prompt
 * @param {InstanceType} openai
 * @returns {Promise} Promise object represents response of dalle image generation api
 */
export async function generateImage(prompt, openai) {
  const response = await openai.createImage({
    prompt: `${prompt}`,
    n: 1,
    size: "256x256",
  });

  return response;
}
