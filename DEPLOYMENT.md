# Deployment Instructions

## Quick Start

### 1. Local Development
```bash
npm install
npm run dev
```
Visit http://localhost:5173

### 2. Production Build
```bash
npm run build
```
This creates a `dist` folder with production-ready files.

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts:
   - Link to existing project? No
   - What's your project's name? ai-interview-assistant
   - In which directory is your code? ./
   - Want to override the settings? No

4. Set environment variables (optional):
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add: `VITE_OPENAI_API_KEY` with your OpenAI API key

### Option 2: Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy via UI:
   - Go to https://app.netlify.com
   - Drag and drop the `dist` folder
   - Your app will be live immediately

3. Set environment variables (optional):
   - Go to Site settings > Environment variables
   - Add: `VITE_OPENAI_API_KEY` with your OpenAI API key

### Option 3: Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

3. Deploy:
```bash
npm run deploy
```

## Environment Variables

Create a `.env` file in the root directory:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The app works without the OpenAI API key but with limited functionality:
- With API key: Dynamic questions, intelligent evaluation, contextual feedback
- Without API key: Predefined questions, basic scoring, keyword-based evaluation

## Testing the Deployment

1. **Upload Resume**: Test with PDF and DOCX files
2. **Missing Info Collection**: Try resumes with missing name/email/phone
3. **Interview Flow**: Complete a full 6-question interview
4. **Timer Functionality**: Let a timer expire to test auto-submit
5. **Dashboard**: Switch to interviewer tab and verify data
6. **Persistence**: Refresh the page mid-interview and check Welcome Back modal
7. **Search/Filter**: Test candidate search in dashboard

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear cache: `npm run clean && npm install`
- Check Node version: Should be 16.x or higher

### Deployment Issues
- Verify environment variables are set correctly
- Check build output for any warnings
- Ensure `dist` folder is generated properly

### Runtime Issues
- Check browser console for errors
- Verify PDF.js worker is loading
- Ensure localStorage is enabled

## Performance Optimization

1. **Enable Compression**: Most deployment platforms handle this automatically
2. **Set Cache Headers**: Configure for static assets
3. **Use CDN**: Vercel and Netlify include CDN by default
4. **Monitor Bundle Size**: Current ~635KB gzipped is acceptable

## Security Notes

1. **API Keys**: Never commit API keys to git
2. **CORS**: Configure if using custom backend
3. **CSP Headers**: Add Content Security Policy for production
4. **Rate Limiting**: Consider adding if using OpenAI API heavily

## Support

For issues or questions:
1. Check the README.md for usage instructions
2. Review browser console for errors
3. Verify all environment variables are set
4. Test with the demo data provided
