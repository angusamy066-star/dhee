import express, { Request, Response } from 'express';
import {
  runDiagnose,
  searchLivestockOutbreaks,
  generateVeoVideo,
  checkVeoStatus,
  getVeoDownloadStream,
  runVoiceConsult,
} from './geminiService';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '50mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'BoviPulse Livestock Diagnostic Engine' });
});

apiRouter.post('/diagnose', async (req: Request, res: Response) => {
  try {
    const result = await runDiagnose(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('API /diagnose error:', error);
    res.status(500).json({ error: error.message || 'Diagnosis failed' });
  }
});

apiRouter.post('/search-outbreaks', async (req: Request, res: Response) => {
  try {
    const queryText = req.body.query || 'current livestock disease outbreaks FMD avian influenza African swine fever alerts';
    const result = await searchLivestockOutbreaks(queryText);
    res.json(result);
  } catch (error: any) {
    console.error('API /search-outbreaks error:', error);
    res.status(500).json({ error: error.message || 'Outbreak search failed' });
  }
});

apiRouter.post('/generate-video', async (req: Request, res: Response) => {
  try {
    const result = await generateVeoVideo(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('API /generate-video error:', error);
    res.status(500).json({ error: error.message || 'Video generation initiation failed' });
  }
});

apiRouter.post('/video-status', async (req: Request, res: Response) => {
  try {
    const operationName = req.body.operationName;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required' });
      return;
    }
    const result = await checkVeoStatus(operationName);
    res.json(result);
  } catch (error: any) {
    console.error('API /video-status error:', error);
    res.status(500).json({ error: error.message || 'Status check failed' });
  }
});

apiRouter.post('/video-download', async (req: Request, res: Response) => {
  try {
    const operationName = req.body.operationName;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required' });
      return;
    }
    const videoRes = await getVeoDownloadStream(operationName);
    res.setHeader('Content-Type', 'video/mp4');
    
    // Convert Web ReadableStream to Node stream pipe
    if (videoRes.body) {
      // @ts-ignore
      const reader = videoRes.body.getReader();
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              break;
            }
            res.write(Buffer.from(value));
          }
        } catch (streamErr) {
          console.error('Stream piping error:', streamErr);
          res.end();
        }
      };
      await pump();
    } else {
      res.status(500).json({ error: 'No video body stream' });
    }
  } catch (error: any) {
    console.error('API /video-download error:', error);
    res.status(500).json({ error: error.message || 'Video download failed' });
  }
});

apiRouter.post('/voice-consult', async (req: Request, res: Response) => {
  try {
    const { query, species } = req.body;
    const result = await runVoiceConsult(query, species);
    res.json(result);
  } catch (error: any) {
    console.error('API /voice-consult error:', error);
    res.status(500).json({ error: error.message || 'Voice consultation failed' });
  }
});
