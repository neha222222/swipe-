# Testing Guide for AI Interview Assistant

## Quick Test Checklist

### 1. Initial Setup
- [ ] Application loads at http://localhost:5173
- [ ] Two tabs visible: Interviewee and Interviewer
- [ ] Clean UI with no console errors

### 2. Resume Upload Flow
- [ ] Upload button is visible and clickable
- [ ] PDF files accepted
- [ ] DOCX files accepted (optional)
- [ ] Error message for unsupported formats
- [ ] Loading indicator during processing

### 3. Information Extraction
- [ ] Name extracted correctly
- [ ] Email extracted correctly  
- [ ] Phone extracted correctly
- [ ] Chatbot asks for missing fields
- [ ] Can manually input missing information

### 4. Interview Process
- [ ] 6 questions generated (2 easy, 2 medium, 2 hard)
- [ ] Timer displays correctly:
  - Easy: 20 seconds
  - Medium: 60 seconds
  - Hard: 120 seconds
- [ ] Timer countdown works
- [ ] Auto-submit when timer expires
- [ ] Manual submit before timer expires
- [ ] Score and feedback after each answer
- [ ] Progress to next question automatically

### 5. Interview Completion
- [ ] Final score calculated
- [ ] Summary generated
- [ ] Interview marked as complete
- [ ] Cannot submit more answers

### 6. Interviewer Dashboard
- [ ] Completed interviews listed
- [ ] Candidates sorted by score
- [ ] Search functionality works
- [ ] Can view detailed candidate information
- [ ] Chat history accessible
- [ ] Question/answer pairs displayed
- [ ] Scores and feedback visible

### 7. Data Persistence
- [ ] Refresh page during interview
- [ ] Welcome Back modal appears
- [ ] Can resume from where left off
- [ ] Timer state preserved
- [ ] All answers saved
- [ ] Can start new interview instead

### 8. Edge Cases
- [ ] Empty answer submission
- [ ] Very long answers (>1000 characters)
- [ ] Special characters in inputs
- [ ] Multiple rapid submissions
- [ ] Browser back/forward navigation

## Test Scenarios

### Scenario 1: Complete Interview
1. Upload SAMPLE_RESUME.txt (convert to PDF first)
2. Complete all 6 questions with varying answer quality
3. Check final score and summary
4. View results in dashboard

### Scenario 2: Missing Information
1. Create a resume without email
2. Upload and verify chatbot asks for email
3. Provide email via chat
4. Verify interview starts

### Scenario 3: Timeout Testing
1. Start an interview
2. Let first question timer expire
3. Verify auto-submission
4. Continue with remaining questions

### Scenario 4: Pause and Resume
1. Start interview
2. Answer 2 questions
3. Refresh browser
4. Click Resume in Welcome Back modal
5. Verify question 3 appears
6. Complete interview

### Scenario 5: Multiple Candidates
1. Complete 3-4 interviews with different names
2. Go to dashboard
3. Verify sorting by score
4. Test search with partial name
5. View details for each candidate

## Performance Testing

### Load Times
- Initial page load: < 3 seconds
- Resume processing: < 2 seconds
- Question generation: < 1 second
- Answer evaluation: < 2 seconds

### Browser Compatibility
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Responsive Design
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## API Testing (with OpenAI Key)

### With Valid API Key
1. Set VITE_OPENAI_API_KEY in .env
2. Restart dev server
3. Verify dynamic question generation
4. Check intelligent answer evaluation
5. Confirm detailed feedback

### Without API Key
1. Remove/empty VITE_OPENAI_API_KEY
2. Restart dev server
3. Verify fallback questions work
4. Check basic scoring functions
5. Confirm keyword-based evaluation

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Buttons have focus states
- [ ] Text is readable (contrast ratio)
- [ ] Error messages are clear
- [ ] Loading states announced

## Security Testing

- [ ] No API keys in console/network
- [ ] Local storage data encrypted
- [ ] XSS prevention (try script tags in answers)
- [ ] File upload size limits enforced
- [ ] No sensitive data in URLs

## Bug Report Template

**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Browser/Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Node version: 18.x

**Screenshots:**
If applicable

**Console Errors:**
Any error messages

## Known Limitations

1. **PDF Parsing**: Complex PDF layouts may not extract information perfectly
2. **Timer Precision**: May have 1-2 second variance due to processing
3. **Concurrent Sessions**: Only one active interview at a time
4. **Browser Storage**: Limited by browser's localStorage capacity
5. **API Rate Limits**: OpenAI API has rate limits for free tier

## Testing Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Support Resources

- Check README.md for setup instructions
- Review DEPLOYMENT.md for deployment options
- See console for detailed error messages
- Test with provided SAMPLE_RESUME.txt
