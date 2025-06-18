"use client";

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import JSZip from 'jszip';
import { Sun, Moon, Maximize2, Minimize2, Music } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
  const [instruction, setInstruction] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [framework, setFramework] = useState('python');
  const [generated, setGenerated] = useState(false);
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

  const handleGenerate = async () => {
    if (!instruction) {
      toast({ description: 'Please enter a description for your agent.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setGenerated(false);
    try {
      const response = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, framework }),
      });
      if (!response.ok) throw new Error('Failed to generate agent code');
      const data = await response.json();
      setCode(data.code);
      setGenerated(true);
      toast({ description: 'Agent code generated successfully.' });
    } catch (error) {
      toast({ description: 'Error generating agent code.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      toast({ description: 'Authentication required. Please sign in to save your agent.', variant: 'destructive' });
      return;
    }
    if (!code) {
      toast({ description: 'No code to save. Please generate your agent first.', variant: 'destructive' });
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
        name: '',
        description: '',
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
            <Label htmlFor="instruction">Describe your agent in English</Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              placeholder="e.g. Create an agent that summarizes news articles daily and emails me the summary."
              rows={4}
            />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Label htmlFor="framework">Framework</Label>
            <Select value={framework} onValueChange={setFramework} id="framework">
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </Select>
            <Button onClick={handleGenerate} disabled={loading} className="ml-auto">
              {loading ? 'Generating...' : 'Generate Agent'}
            </Button>
          </div>
        </div>
      </Card>
      {generated && (
        <Card className="p-6 mt-6">
          <Label className="mb-2 block">Generated Agent Code</Label>
          <Editor
            height="400px"
            defaultLanguage={framework}
            language={framework}
            value={code}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
          <Button onClick={handleSave} className="mt-4">Save Agent</Button>
        </Card>
      )}
    </div>
  );
} 