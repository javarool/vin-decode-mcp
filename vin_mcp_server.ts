// VIN Decoder MCP Server for trucking insurance
// npm install fastmcp @cardog/corgi zod

import { FastMCP } from "fastmcp";
import { quickDecode } from "@cardog/corgi";
import { z } from "zod";

// Minimal type for trucking vehicle data
interface TruckingVehicleData {
  vin: string;
  year: number;
  make: string;
  model?: string;
   // gvwr?: number;
  bodyStyle?: string;
  isCommercialTruck: boolean;
}

// MCP server instance
const server = new FastMCP({
  name: "VIN Decoder for Trucking Insurance",
  version: "1.0.0",
  description: "VIN decoding for commercial trucks and insurance form filling",
});

// Truck manufacturer WMI codes
const TRUCK_MANUFACTURERS: Record<string, string> = {
  '1FU': 'Freightliner', '1M1': 'Mack', '1M2': 'Mack', '1NK': 'Kenworth',
  '1NL': 'Kenworth', '1XP': 'Peterbilt', '1XK': 'Peterbilt',
  '3AK': 'International', '3HS': 'International', '5NP': 'Volvo',
  '4V4': 'Volvo', '4V5': 'Volvo'
};

// Identify if VIN belongs to a commercial truck
function isCommercialTruck(vin: string): boolean {
  const wmi = vin.substring(0, 3).toUpperCase();
  return !!TRUCK_MANUFACTURERS[wmi];
}

// Batch VIN decoding tool
server.addTool({
  name: "decode_vin_batch",
  description: "Decode multiple VINs at once for truck fleets",
  parameters: z.object({
    vins: z.array(z.string()).min(1).max(50).describe("Array of VINs (up to 50)"),
  }),
  execute: async ({ vins }) => {
    const results = [];
    const errors = [];
    for (const vin of vins) {
      try {
        const fullResult = await quickDecode(vin.trim());
        const vehicleData: TruckingVehicleData = {
          vin: vin.toUpperCase(),
          year: fullResult.components.vehicle?.year || 0,
          make: fullResult.components.vehicle?.make || 'Unknown',
          model: fullResult.components.vehicle?.model,
          // gvwr: fullResult.components.vehicle?.gvwr,
          bodyStyle: fullResult.components.vehicle?.bodyStyle,
          isCommercialTruck: isCommercialTruck(vin),
        };
        results.push(vehicleData);
      } catch (error) {
        errors.push({
          vin,
          error: `Decoding error: ${error instanceof Error ? error.message : error}`
        });
      }
    }
    return JSON.stringify({
      success: results.length > 0,
      totalProcessed: vins.length,
      successfulDecodes: results.length,
      errors: errors.length,
      results,
      errorDetails: errors
    }, null, 2);
  }
});

// Truck manufacturers reference resource
server.addResource({
  uri: "truck://manufacturers",
  name: "Truck Manufacturers Reference",
  description: "Reference of commercial truck manufacturers by WMI codes",
  mimeType: "application/json",
  fetch: async () => {
    const manufacturers = Object.entries(TRUCK_MANUFACTURERS).map(([wmi, name]) => ({
      wmi,
      name,
      description: `WMI code ${wmi} corresponds to manufacturer ${name}`
    }));
    return JSON.stringify({
      manufacturers,
      total: manufacturers.length,
      note: "These are the main commercial truck manufacturers. The full list is available via the NHTSA API."
    }, null, 2);
  }
});

// Start server
async function startServer() {
  try {
    console.log("🚛 Starting VIN Decoder MCP Server for Trucking Insurance...");
    try {
      await quickDecode("1FUJGBDV85LM12345");
      console.log("✅ Cardog database is available");
    } catch {
      console.log("❌ Cardog unavailable - server requires @cardog/corgi to function");
      process.exit(1);
    }
    await server.start({
      transportType: "stdio",
    });
    console.log("✅ MCP server started and ready!");
  } catch (error) {
    console.error("❌ Server start error:", error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log("\n🛑 Termination signal received, stopping server...");
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default server;