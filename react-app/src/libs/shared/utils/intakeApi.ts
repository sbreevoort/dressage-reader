interface AnthropicResponse {
  content: { type: string; text: string }[];
}

export interface CandidateData {
  Voornaam: string;
  Achternaam: string;
  Functie: string;
  Uren: string;
  Regio: string;
  Samenvatting: string;
}

export const analyzeIntake = async (transcription: string): Promise<CandidateData> => {
  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content:
            'Je bent een recruiter-assistent. Analyseer de volgende gesproken samenvatting van een kandidaat en extraheer de gegevens. ' +
            'Geef ALLEEN een geldig JSON object terug met precies deze zes sleutels: ' +
            '"Voornaam" (voornaam van kandidaat), ' +
            '"Achternaam" (achternaam van kandidaat), ' +
            '"Functie" (gewenste of huidige functietitel), ' +
            '"Uren" (beschikbaarheid in uren per week, bijv. "32" of "40"), ' +
            '"Regio" (regio of stad waar kandidaat wil werken), ' +
            '"Samenvatting" (gedraag je als een expert reqruiter, en schrijf een pitch van 3 zinnen: een overtuigende en professionele introductie van de kandidaat voor een klant). ' +
            'Als informatie ontbreekt, gebruik dan een lege string. ' +
            'Kandidaat samenvatting: ' +
            transcription,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API fout: ${response.status} ${response.statusText}`);
  }

  const data: AnthropicResponse = await response.json();
  const rawText = data.content[0].text;

  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : rawText.trim();

  const result: CandidateData = JSON.parse(jsonString);
  return result;
};
