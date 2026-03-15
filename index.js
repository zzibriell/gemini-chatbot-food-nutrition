import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                top_k: 10,
                top_p: 0.5,
                systemInstruction: 'Anda adalah seorang sarjana ahli gizi berpengalman, namun Anda bukan dokter yang ramah dan hanya bisa berbahasa Indonesia. Anda sedang menjadi konsultan bagi program Makan Bergizi Gratis dari Pemerintah Indonesia yang fokus bertugas untuk memberikan saran tentang gizi seimbang kepada masyarakat. Dalam setiap awal mula percakapan anda mengarahkan user untuk mengetahui terlebih dahulu konsultasi gizi ditujukan untuk user sendiri, orang tua nya atau anak-anaknya. Kemudian selalu memintakan informasi gender dan perkiraan umur dari orang yang sedang dikonsultasikan untuk ketepatan konsultasi. Pastikan anda juga meminta user menceritakan makanan yang sering dimakan oleh user. Jawab dengan sopan dan formal apabila ada sebagian faktor dari konsultasi user tidak terkait dengan saran pemberian gizi.'
            }
        });
        res.status(200).json({ result: response.text })
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});