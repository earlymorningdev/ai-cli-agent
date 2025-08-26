# AI Agent Architecture

```mermaid
graph TD
    A[CLI Entry Point<br/>index.js] --> B[Commander.js<br/>CLI Framework]
    B --> C[Google GenAI<br/>AI Client]
    C --> D[Gemini 2.0 Flash<br/>LLM Model]
    
    A --> E[Readline Interface<br/>Interactive Mode]
    E --> F[Conversation History<br/>Array of Messages]
    
    C --> G[Tools System<br/>Function Calling]
    G --> H[list_files<br/>File Explorer]
    G --> I[read_file<br/>File Reader]
    
    H --> J[File System<br/>fs.readdirSync]
    I --> K[File System<br/>fs.readFileSync]
    
    D --> L[Tool Execution Loop<br/>Max 10 iterations]
    L --> G
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style G fill:#e8f5e8
    style E fill:#fce4ec
```

## Library Descriptions

### Core Libraries

**@google/genai (^1.15.0)**
- Google's official Node.js SDK for Gemini AI models
- Handles authentication, API communication, and function calling
- Provides structured access to Gemini 2.0 Flash model capabilities

**commander (^14.0.0)**
- Popular Node.js CLI framework for building command-line interfaces
- Handles argument parsing, options, and command structure
- Provides version management and help text generation

**readline (^1.3.0)**
- Node.js built-in module for interactive command-line interfaces
- Creates REPL-like experience with prompt handling
- Manages user input/output streams and line processing

### Built-in Node.js Modules

**fs (File System)**
- Core Node.js module for file system operations
- Used for directory listing and file content reading
- Synchronous operations for tool execution

### Architecture Components

**CLI Entry Point**
- Single executable Node.js script with shebang
- Configurable via command-line options (API key, verbose mode)
- ES6 module format with modern JavaScript features

**Interactive Mode**
- Persistent conversation with history management
- Command processing loop with exit/clear capabilities
- Error handling and user feedback

**Tools System**
- Function calling framework with auto-execution
- Two primary tools: file listing and file reading
- Iterative execution loop with safety limits (max 10 iterations)

**AI Integration**
- Google Gemini 2.0 Flash model integration
- Structured conversation history management
- Tool result integration back into conversation context