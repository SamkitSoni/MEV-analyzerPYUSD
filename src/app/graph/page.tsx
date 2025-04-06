"use client";

import { useState } from 'react';
import CSVUploader from '@/components/CSVUploader';
import SandwichChart from '@/components/SandwichChart';

export default function Dashboard() {
    interface TransformedDataItem {
        block_number: number;
        attack_count: number;
    }

    const [sandwichData, setSandwichData] = useState<TransformedDataItem[]>([]);

    // Define the CSVDataItem interface outside the function
    interface CSVDataItem {
        block_number: string;
    }

    const handleDataParsed = (data: CSVDataItem[]) => {
      // Transform CSV data into chart-compatible format

      interface TransformedDataItem {
        block_number: number;
        attack_count: number;
      }

      const transformedData: TransformedDataItem[] = data.reduce((acc: TransformedDataItem[], item: CSVDataItem) => {
        const block = acc.find((b) => b.block_number === parseInt(item.block_number));
        if (block) {
          block.attack_count += 1;
        } else {
          acc.push({ block_number: parseInt(item.block_number), attack_count: 1 });
        }
        return acc;
      }, []);
      setSandwichData(transformedData);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Sandwich Attack Dashboard</h1>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* CSVUploader automatically loads suspiciousTxs.csv */}
                <CSVUploader onDataParsed={handleDataParsed} />

                {/* Render the SandwichChart if data is available */}
                {sandwichData.length > 0 && <SandwichChart data={sandwichData} />}
            </div>
        </div>
    );
}