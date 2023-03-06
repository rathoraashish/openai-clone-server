/**
 * BETA
 * @param {string} prompt 
 * @param {InstanceType} openai 
 * @returns {Promise} Promise object represents response of sppech
 */
export async function genrateVoiceToText(openai) {
    const response = await openai.createCompletion({
        "file": "audio.mp3",
        "model": "whisper-1"
    })

    return response;
}