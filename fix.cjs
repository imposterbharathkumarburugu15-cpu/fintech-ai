const fs = require('fs');
let code = fs.readFileSync('src/components/NexusAI.jsx', 'utf8');

// We will replace the entire mockGeminiStream
const startIdx = code.indexOf('const mockGeminiStream =');
const endIdx = code.indexOf('function Message({ msg, isStreaming }) {');

if (startIdx !== -1 && endIdx !== -1) {
  const newMock = `const mockGeminiStream = async (userContent, onChunk) => {
  const responses = [
    "I'd be happy to help you analyze that! ",
    "Based on your recent financial data and portfolio allocation, ",
    "it looks like you have a strong concentration in the **Tech sector (35%)**, especially considering the upcoming **NVIDIA earnings report**. ",
    "\\n\\nHere is a quick breakdown of your current allocation:\\n\\n",
    "| Sector | Allocation | Performance (YTD) |\\n|---|---|---|\\n| Tech | 35% | +14.2% |\\n| Finance | 20% | +5.1% |\\n| Healthcare | 15% | +2.4% |\\n\\n",
    "If you'd like, I can help you model some rebalancing scenarios or analyze your discretionary spending to free up more capital for your emergency fund. ",
    "What would you like to explore next?"
  ];
  
  if (userContent.toLowerCase().includes("spend")) {
    responses.length = 0;
    responses.push(
      "Let's take a look at your spending trends for this month. ",
      "You've spent a total of **$4,250** so far, which is 12% lower than this time last month! ",
      "\\n\\nHere are your top 3 categories:\\n",
      "- **Housing**: $2,100\\n",
      "- **Dining**: $450 (⬇️ 28% decrease)\\n",
      "- **Groceries**: $320\\n\\n",
      "Great job cutting back on dining out! Would you like to adjust your budget for next month based on these new habits?"
    );
  }

  for (const chunk of responses) {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));
    onChunk(chunk);
  }
};
`;
  code = code.substring(0, startIdx) + newMock + code.substring(endIdx);
  fs.writeFileSync('src/components/NexusAI.jsx', code);
}
