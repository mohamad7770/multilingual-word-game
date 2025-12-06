    }
    initGame();
  });

  // Setup other button events
  if (leaderboardButton) leaderboardButton.mousePressed(() => showLeaderboard(leaderboardBody));
  if (clearLeaderboardButton) clearLeaderboardButton.mousePressed(clearLeaderboard);
  if (backToGameButton) backToGameButton.mousePressed(backToGame);
}

function loadAndProcessData() {
  wordPairs = [];
  
  if (!table || table.getRowCount() === 0) {
    console.warn('Table is empty');
    return;
  }

  console.log(`Rows in file: ${table.getRowCount()}`);
  
  for (let i = 0; i < table.getRowCount(); i++) {
    try {
      const row = table.getRow(i);
      
      // Read data safely
      const src = row.get('source_lang') || row.get(0);
      const tgt = row.get('target_lang') || row.get(1);
      const srcTxt = row.get('source_text') || row.get(2);
      const tgtTxt = row.get('target_text') || row.get(3);
      
      if (src && tgt && srcTxt && tgtTxt) {
        const srcStr = String(src).trim();
        const tgtStr = String(tgt).trim();
        const srcTxtStr = String(srcTxt).trim();
        const tgtTxtStr = String(tgtTxt).trim();
        
        if ((srcStr === 'английский' && tgtStr === 'русский') ||
            (srcStr === 'русский' && tgtStr === 'английский')) {
          wordPairs.push({
            english: srcStr === 'английский' ? srcTxtStr : tgtTxtStr,
            russian: srcStr === 'русский' ? srcTxtStr : tgtTxtStr
          });
