# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VIN (Vehicle Identification Number) decoder MCP (Model Context Protocol) server specifically designed for trucking insurance applications. The server provides tools to decode VIN numbers, extract vehicle information, and prepare data for insurance forms.

### Key Architecture

- **Main Server**: `vin_mcp_server.ts` - FastMCP-based server with multiple tools
- **Dual Decoder Strategy**:
  - Primary: @cardog/corgi for full database access
  - Fallback: SimpleVINDecoder for basic decoding when external API unavailable
- **Focus**: Commercial trucks and trucking insurance workflow

### Core Components

- **SimpleVINDecoder**: Local fallback decoder with truck manufacturer mappings (WMI codes)
- **Four Main Tools**:
  - `decode_vin_basic`: Basic VIN validation and decoding
  - `decode_vin_full`: Full decoding with all specs via external API
  - `prepare_insurance_form_data`: Format data for insurance forms (Northland, RIA)
  - `decode_vin_batch`: Process multiple VINs for fleet applications
- **Resource**: Truck manufacturer reference by WMI codes

## Development Commands

### Basic Operations
- **Development/Testing**: `npm run dev` or `npx fastmcp dev server.ts`
- **Build**: `npm run build` (compiles TypeScript to dist/)
- **Production**: `npm start`
- **Quick Test**: `npm test` (alias for dev mode)

### Development Workflow
1. Test server interactively: `npx fastmcp dev server.ts`
2. Test VIN decoding: `vindecode '1FUJGBDV85LM12345'` (in interactive mode)
3. Test batch processing: `vindecode ['VIN1', 'VIN2']`

### MCP Integration
The server runs as stdio transport for Claude Desktop integration. Add to `~/.claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "vin-decoder": {
      "command": "npx",
      "args": ["tsx", "/full/path/to/vin_mcp_server.ts"]
    }
  }
}
```

## Technical Details

### Dependencies
- **fastmcp**: MCP server framework
- **@cardog/corgi**: External VIN database API (optional)
- **zod**: Schema validation
- **tsx**: TypeScript execution (dev)

### Data Handling
- Validates 17-character VIN format with proper characters (no I, O, Q)
- Year decoding from position 10 with 30-year cycle handling
- Commercial truck detection via WMI (World Manufacturer Identifier) codes
- Error handling for both single VIN and batch operations

### Insurance Form Integration
Supports specific form types with validation:
- **Northland**: Requires GVWR, physical damage eligibility checks
- **RIA**: Simplified form requirements
- **General**: Basic commercial truck validation

The server is designed to handle the complete trucking insurance workflow from VIN input to form-ready data output.