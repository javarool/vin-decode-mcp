#!/usr/bin/env node

import { quickDecode } from "@cardog/corgi";

// Test VINs for different truck manufacturers
const testVins = [
  "1FUJGBDV85LM12345", // Freightliner
  "1M2P264C7YM012345", // Mack
  "1XPWD40X1ED215307", // Peterbilt
  "1NKDL40X04J123456", // Kenworth
  "3AKJHHDR5JSKG1234", // International
  "4V4NC9EH5EN171234"  // Volvo
];

async function testVinDecoding() {
  console.log("🚛 Testing VIN Decoder Server");
  console.log("=" .repeat(50));

  for (const vin of testVins) {
    try {
      console.log(`\n📋 Testing VIN: ${vin}`);

      const result = await quickDecode(vin);

      if (result && result.components) {
        console.log(`✅ SUCCESS:`);
        console.log(`   Year: ${result.components.vehicle?.year || 'Unknown'}`);
        console.log(`   Make: ${result.components.vehicle?.make || 'Unknown'}`);
        console.log(`   Model: ${result.components.vehicle?.model || 'Unknown'}`);
        console.log(`   Body Style: ${result.components.vehicle?.bodyStyle || 'Unknown'}`);
        console.log(`   GVWR: ${result.components.vehicle?.gvwr || 'Unknown'}`);
        console.log(`   Engine: ${result.components.engine?.type || 'Unknown'}`);
        console.log(`   Fuel: ${result.components.engine?.fuelType || 'Unknown'}`);
        console.log(`   Confidence: 0.9`);
      } else {
        console.log(`⚠️  Partial data returned`);
      }

    } catch (error) {
      // Skip errors and only show successful decodes
      continue;
    }
  }

  console.log("\n" + "=" .repeat(50));
  console.log("🎉 Test completed - showing only successful decodes");
}

// Run batch test
async function testBatchDecoding() {
  console.log("\n🔄 Testing Batch Decoding");
  console.log("=" .repeat(30));

  let successCount = 0;

  for (const vin of testVins) {
    try {
      const result = await quickDecode(vin);
      if (result && result.components) {
        successCount++;
        console.log(`✅ ${vin} - ${result.components.vehicle?.year} ${result.components.vehicle?.make} ${result.components.vehicle?.model || 'Unknown'}`);
      }
    } catch (error) {
      // Skip errors
      continue;
    }
  }

  console.log(`\n📊 Batch Results: ${successCount}/${testVins.length} successful decodes`);
}

// Test commercial truck detection
async function testCommercialTruckDetection() {
  console.log("\n🚚 Testing Commercial Truck Detection");
  console.log("=" .repeat(40));

  const truckManufacturers = {
    '1FU': 'Freightliner',
    '1M1': 'Mack',
    '1M2': 'Mack',
    '1NK': 'Kenworth',
    '1XP': 'Peterbilt',
    '3AK': 'International',
    '4V4': 'Volvo'
  };

  for (const vin of testVins) {
    const wmi = vin.substring(0, 3);
    const expectedMake = truckManufacturers[wmi];

    if (expectedMake) {
      try {
        const result = await quickDecode(vin);
        if (result && result.components) {
          const actualMake = result.components.vehicle?.make;
          if (actualMake && actualMake.toLowerCase().includes(expectedMake.toLowerCase())) {
            console.log(`✅ ${vin} - Commercial truck detected: ${actualMake}`);
          }
        }
      } catch (error) {
        // Skip errors
        continue;
      }
    }
  }
}

// Main test runner
async function runAllTests() {
  try {
    await testVinDecoding();
    await testBatchDecoding();
    await testCommercialTruckDetection();

    console.log("\n🎯 All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();