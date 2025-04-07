import { fetchPYUSDTransfers } from '@/queries/fetchPyusdTxs';
import { detectSandwiches } from '@/analysis/detectSandwiches';
import { writeToPath } from 'fast-csv';

require('dotenv').config();

export default async function sandwitchCSV() {
  try {
    const transactions = await fetchPYUSDTransfers();

    if (!transactions || !transactions.length) {
      console.log("No transactions found.");
      return;
    }

    // Pass transactions to detectSandwiches
    const suspiciousTxs = await detectSandwiches();

    if (!suspiciousTxs || !suspiciousTxs.length) {
      console.log("No sandwich attacks detected.");
      return;
    }

    const outputPath = '@/public/suspiciousTxs.csv';

    writeToPath(outputPath, suspiciousTxs, { headers: true })
      .on('finish', () => console.log(`CSV export complete! Saved to: ${outputPath}`));
  } catch (err) {
    console.error("Error running MEV detection:", err);
  }
}