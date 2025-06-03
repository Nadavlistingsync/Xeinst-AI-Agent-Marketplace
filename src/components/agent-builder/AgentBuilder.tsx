"use client";

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import JSZip from 'jszip';

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
    <div className="space-y-6">
      <Card className="p-6">
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

      <Card className="p-6">
        <Label>Agent Code</Label>
        <div className="h-[500px] mt-2">
          <Editor
            height="100%"
            defaultLanguage={framework}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
            }}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Agent</Button>
      </div>
    </div>
  );
} 