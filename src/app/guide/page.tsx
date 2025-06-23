import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  FileText, 
  Settings, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Download,
  Upload,
  Lightbulb,
  BookOpen,
  Play
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Xeinst Agent Compatibility Guide | AI Agency',
  description: 'Learn how to create Xeinst-compatible AI agents with our comprehensive guide. Follow best practices for seamless integration.',
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Xeinst Agent Compatibility Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to create AI agents that seamlessly integrate with the Xeinst platform. 
            Follow our comprehensive guide to ensure your agents work perfectly in our marketplace.
          </p>
        </div>

        {/* Quick Start Section */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Zap className="w-6 h-6" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Upload Agent</h3>
                <p className="text-sm text-gray-600">Upload your agent file in JSON format</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Configure</h3>
                <p className="text-sm text-gray-600">Add metadata and configuration</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Deploy</h3>
                <p className="text-sm text-gray-600">Publish to marketplace</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Structure Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Agent File Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Required Fields</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">name</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">description</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">version</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">inputSchema</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">execute</code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Optional Fields</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">documentation</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">examples</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">tags</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Example Agent File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "name": "Text Summarizer",
  "description": "Summarizes long text into concise versions",
  "version": "1.0.0",
  "inputSchema": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Text to summarize"
      },
      "maxLength": {
        "type": "number",
        "description": "Maximum summary length"
      }
    },
    "required": ["text"]
  },
  "execute": "async (input) => { ... }",
  "documentation": "Detailed usage instructions...",
  "tags": ["nlp", "summarization"]
}`}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {/* Input Schema Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Input Schema Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">JSON Schema Format</h4>
                  <p className="text-gray-600 mb-4">
                    Your agent must define an input schema using JSON Schema format. This tells Xeinst what inputs your agent expects and automatically generates the user interface.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Best Practices:</h5>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Use descriptive property names and descriptions</li>
                      <li>• Mark required fields with the "required" array</li>
                      <li>• Use appropriate data types (string, number, boolean, object, array)</li>
                      <li>• Add validation rules like min/max values, patterns, etc.</li>
                      <li>• Include examples in property descriptions</li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-2">Simple Input Example</h5>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "Your message"
    }
  },
  "required": ["message"]
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2">Complex Input Example</h5>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "description": "Text to process"
    },
    "options": {
      "type": "object",
      "properties": {
        "language": {
          "type": "string",
          "enum": ["en", "es", "fr"]
        },
        "format": {
          "type": "string",
          "enum": ["markdown", "html", "plain"]
        }
      }
    }
  },
  "required": ["text"]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execute Function Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Execute Function Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Function Signature</h4>
                  <p className="text-gray-600 mb-4">
                    Your agent must provide an execute function that processes the input and returns a result. This function will be called when users interact with your agent.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-2">Basic Execute Function</h5>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`async function execute(input) {
  const { message } = input;
  
  // Your agent logic here
  const response = await processMessage(message);
  
  return {
    success: true,
    result: response,
    metadata: {
      processingTime: Date.now()
    }
  };
}`}
                    </pre>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2">Advanced Execute Function</h5>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`async function execute(input) {
  try {
    const { text, options = {} } = input;
    
    // Validate input
    if (!text) {
      throw new Error("Text is required");
    }
    
    // Process with options
    const result = await processWithOptions(text, options);
    
    return {
      success: true,
      result: result,
      metadata: {
        inputLength: text.length,
        options: options,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 mb-2">Important Notes:</h5>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Always return an object with a "success" boolean field</li>
                    <li>• Include the result in a "result" field when successful</li>
                    <li>• Include error details in an "error" field when failed</li>
                    <li>• Use async/await for asynchronous operations</li>
                    <li>• Add proper error handling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Testing Your Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Before uploading to Xeinst, test your agent thoroughly to ensure it works correctly.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">1. Local Testing</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Test with various input types</li>
                      <li>• Verify error handling</li>
                      <li>• Check response format</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">2. Schema Validation</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Validate JSON schema syntax</li>
                      <li>• Test with sample inputs</li>
                      <li>• Check required fields</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-purple-800 mb-2">3. Performance</h5>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Test response times</li>
                      <li>• Check memory usage</li>
                      <li>• Verify scalability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Process Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Step-by-Step Upload</h4>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
                        <div>
                          <p className="font-medium">Prepare your agent file</p>
                          <p className="text-sm text-gray-600">Ensure it follows the Xeinst format</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
                        <div>
                          <p className="font-medium">Go to Upload page</p>
                          <p className="text-sm text-gray-600">Navigate to the agent upload section</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
                        <div>
                          <p className="font-medium">Fill in metadata</p>
                          <p className="text-sm text-gray-600">Add name, description, category, etc.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
                        <div>
                          <p className="font-medium">Upload and test</p>
                          <p className="text-sm text-gray-600">Test your agent in the platform</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Common Issues</h4>
                    <div className="space-y-3">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-red-800 text-sm">Invalid JSON Schema</h5>
                        <p className="text-sm text-red-700">Ensure your inputSchema follows JSON Schema specification</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-red-800 text-sm">Missing Required Fields</h5>
                        <p className="text-sm text-red-700">Check that all required fields are present</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h5 className="font-semibold text-red-800 text-sm">Execute Function Errors</h5>
                        <p className="text-sm text-red-700">Test your execute function thoroughly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Upload Your Agent?</h2>
            <p className="text-blue-100 mb-6">
              Follow this guide to create Xeinst-compatible agents and start earning from your AI creations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Agent
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-center mb-8">Additional Resources</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Best Practices</h4>
                <p className="text-gray-600 text-sm mb-4">Learn industry best practices for creating effective AI agents</p>
                <Button variant="outline" size="sm">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Code className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Code Examples</h4>
                <p className="text-gray-600 text-sm mb-4">Browse through working examples of Xeinst-compatible agents</p>
                <Button variant="outline" size="sm">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Examples
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Templates</h4>
                <p className="text-gray-600 text-sm mb-4">Download ready-to-use templates for common agent types</p>
                <Button variant="outline" size="sm">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 