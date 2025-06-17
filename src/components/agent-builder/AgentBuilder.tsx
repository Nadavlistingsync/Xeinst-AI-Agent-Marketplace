"use client";

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import JSZip from 'jszip';
import { Sun, Moon, Maximize2, Minimize2, Music } from 'lucide-react';

interface AgentBuilderProps {
  onSave?: (agent: {
    name: string;
    description: string;
    framework: string;
    code: string;
    requirements: string;
  }) => void;
}

export function AgentBuilder({ onSave }: AgentBuilderProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('python');
  const [code, setCode] = useState('# Your agent code here\n');
  const [requirements, setRequirements] = useState('');
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [zenMode, setZenMode] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const motivationalQuotes = [
    "Code is like humor. When you have to explain it, it's bad.",
    "Simplicity is the soul of efficiency.",
    "Dream in code, build in reality.",
    "Stay curious, keep coding.",
    "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it."
  ];
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const [showMusic, setShowMusic] = useState(false);

  const handleSave = async () => {
    if (!session) {
      toast({ description: 'Authentication required. Please sign in to save your agent.', variant: 'destructive' });
      return;
    }

    if (!name || !code) {
      toast({ description: 'Missing required fields. Please provide a name and code for your agent.', variant: 'destructive' });
      return;
    }

    // Create a zip file with the agent code and requirements
    const zip = new JSZip();
    zip.file('agent.py', code);
    if (requirements) {
      zip.file('requirements.txt', requirements);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const formData = new FormData();
    formData.append('file', zipBlob, 'agent.zip');

    try {
      // Upload the zip file
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload agent');
      }

      const { file_url } = await uploadResponse.json();

      // Save the agent metadata
      const agentData = {
        name,
        description,
        framework,
        file_url: file_url,
        requirements,
        code,
      };

      if (onSave) {
        onSave(agentData);
      }

      toast({ description: 'Agent saved successfully. Your agent has been saved and is ready to be deployed.' });
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({ description: 'There was an error saving your agent. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className={`relative space-y-6 transition-all duration-500 ${zenMode ? 'fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center' : ''}`}
      style={{
        background: zenMode ? 'linear-gradient(135deg, #232526 0%, #414345 100%)' : 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
        minHeight: zenMode ? '100vh' : undefined,
      }}
    >
      {/* Motivational Quote & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="text-lg italic text-blue-700 font-semibold drop-shadow-md animate-fade-in">
          {quote}
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            title="Toggle Editor Theme"
          >
            {theme === 'vs-dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
          <button
            className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition"
            onClick={() => setZenMode(!zenMode)}
            title="Toggle Zen Mode"
          >
            {zenMode ? <Minimize2 className="w-5 h-5 text-purple-700" /> : <Maximize2 className="w-5 h-5 text-purple-700" />}
          </button>
          <button
            className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition"
            onClick={() => setShowMusic(!showMusic)}
            title="Play Lofi Music"
          >
            <Music className="w-5 h-5 text-pink-600" />
          </button>
        </div>
      </div>
      {showMusic && (
        <div className="mb-4 w-full flex justify-center animate-fade-in">
          <iframe
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator"
            width="340"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl shadow-lg border border-pink-200"
            title="Lofi Music Player"
          ></iframe>
        </div>
      )}
      <Card className={`p-6 shadow-2xl rounded-2xl transition-all duration-500 ${zenMode ? 'w-[90vw] h-[90vh] max-w-none max-h-none' : ''} bg-white/80 backdrop-blur-md`}> 
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter agent description"
            />
          </div>
          <div>
            <Label htmlFor="framework">Framework</Label>
            <Select
              value={framework}
              onValueChange={setFramework}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="requirements">Requirements (optional)</Label>
            <Input
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Enter requirements (e.g., numpy==1.21.0)"
            />
          </div>
        </div>
      </Card>
      <Card
        ref={editorContainerRef}
        className={`p-0 shadow-2xl rounded-2xl mt-6 transition-all duration-500 overflow-hidden ${zenMode ? 'w-[90vw] h-[60vh] max-w-none max-h-none' : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'}`}
        style={{ border: zenMode ? '2px solid #a78bfa' : undefined }}
      >
        <Label className="px-6 pt-6 text-lg font-semibold text-gray-700">Agent Code</Label>
        <div className={`h-[500px] mt-2 ${zenMode ? 'h-[60vh]' : ''}`}>
          <Editor
            height={zenMode ? '60vh' : '500px'}
            defaultLanguage={framework}
            language={framework}
            value={code}
            onChange={(value: string | undefined) => setCode(value || '')}
            theme={theme}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              wordWrap: 'on',
              smoothScrolling: true,
              fontFamily: 'Fira Mono, monospace',
              cursorSmoothCaretAnimation: true,
              renderLineHighlight: 'all',
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              lineNumbers: 'on',
              renderValidationDecorations: 'on',
              ariaLabel: 'Agent code editor',
              placeholder: '# Start coding your agent here!\n# Write code, add comments, and vibe.'
            }}
          />
        </div>
      </Card>
      <div className={`flex justify-end ${zenMode ? 'w-[90vw]' : ''}`}>
        <Button onClick={handleSave} className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition">
          Save Agent
        </Button>
      </div>
    </div>
  );
} 