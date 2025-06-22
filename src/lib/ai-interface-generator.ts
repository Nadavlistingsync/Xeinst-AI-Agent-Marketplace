import { Agent } from '@/types/agent';

export interface GeneratedInterface {
  id: string;
  agentId: string;
  components: InterfaceComponent[];
  styles: string;
  layout: string;
  metadata: {
    title: string;
    description: string;
    theme: 'light' | 'dark' | 'auto';
    responsive: boolean;
    accessibility: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InterfaceComponent {
  id: string;
  type: 'input' | 'output' | 'button' | 'card' | 'form' | 'chart' | 'table' | 'text' | 'image' | 'custom';
  props: Record<string, any>;
  children?: InterfaceComponent[];
  validation?: ValidationRule[];
  styling?: ComponentStyle;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface ComponentStyle {
  className?: string;
  inline?: Record<string, string>;
  responsive?: Record<string, Record<string, string>>;
  animations?: string[];
}

export interface AIGenerationOptions {
  theme?: 'modern' | 'minimal' | 'professional' | 'creative';
  layout?: 'single-column' | 'two-column' | 'grid' | 'dashboard';
  features?: ('charts' | 'real-time' | 'file-upload' | 'preview' | 'history')[];
  complexity?: 'simple' | 'standard' | 'advanced';
}

export class AIInterfaceGenerator {
  private static instance: AIInterfaceGenerator;

  private constructor() {}

  public static getInstance(): AIInterfaceGenerator {
    if (!AIInterfaceGenerator.instance) {
      AIInterfaceGenerator.instance = new AIInterfaceGenerator();
    }
    return AIInterfaceGenerator.instance;
  }

  /**
   * Generate a complete user interface for an agent based on its schema and metadata
   */
  async generateInterface(
    agent: Agent,
    options: AIGenerationOptions = {}
  ): Promise<GeneratedInterface> {
    const {
      theme = 'modern',
      layout = 'single-column',
      features = ['preview'],
      complexity = 'standard'
    } = options;

    // Analyze the agent's input schema to determine appropriate components
    const inputComponents = this.generateInputComponents(agent);
    const outputComponents = this.generateOutputComponents(agent);
    const actionComponents = this.generateActionComponents(agent);

    // Generate the layout structure
    const layoutComponents = this.generateLayout(layout, {
      inputs: inputComponents,
      outputs: outputComponents,
      actions: actionComponents,
      features
    });

    // Generate styling based on theme
    const styles = this.generateStyles(theme, complexity);

    // Generate metadata
    const metadata = this.generateMetadata(agent, theme);

    return {
      id: `interface_${agent.id}_${Date.now()}`,
      agentId: agent.id,
      components: layoutComponents,
      styles,
      layout,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate input components based on the agent's JSON schema
   */
  private generateInputComponents(agent: Agent): InterfaceComponent[] {
    const components: InterfaceComponent[] = [];
    
    // Try to parse input schema from documentation or create default components
    let schema: any = null;
    
    // Check if there's any schema information in the documentation
    if (agent.documentation) {
      try {
        // Look for JSON schema in documentation
        const schemaMatch = agent.documentation.match(/\{[\s\S]*"properties"[\s\S]*\}/);
        if (schemaMatch) {
          schema = JSON.parse(schemaMatch[0]);
        }
      } catch (error) {
        // If parsing fails, continue with default components
      }
    }
    
    // If we have a valid schema, create components from it
    if (schema && schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        const component = this.createInputComponent(key, prop, schema.required?.includes(key));
        if (component) {
          components.push(component);
        }
      });
    } else {
      // Create default input components based on agent description
      const defaultInputs = this.createDefaultInputComponents(agent);
      components.push(...defaultInputs);
    }

    return components;
  }

  /**
   * Create default input components when no schema is available
   */
  private createDefaultInputComponents(agent: Agent): InterfaceComponent[] {
    const components: InterfaceComponent[] = [];
    
    // Create a default text input for the main input
    components.push({
      id: 'input',
      type: 'input',
      props: {
        id: 'input',
        name: 'input',
        label: 'Input',
        placeholder: `Enter your ${agent.name.toLowerCase()} input...`,
        required: true
      },
      validation: [
        {
          type: 'required',
          value: true,
          message: 'Input is required'
        }
      ],
      styling: {
        className: 'form-input'
      }
    });

    // Add additional context field if it's a complex agent
    if (agent.description && agent.description.length > 100) {
      components.push({
        id: 'context',
        type: 'text',
        props: {
          id: 'context',
          name: 'context',
          label: 'Additional Context',
          placeholder: 'Provide any additional context or parameters...',
          rows: 3
        },
        styling: {
          className: 'form-textarea'
        }
      });
    }

    return components;
  }

  /**
   * Create an input component based on schema property
   */
  private createInputComponent(
    key: string,
    prop: any,
    required: boolean = false
  ): InterfaceComponent | null {
    const baseProps = {
      id: key,
      name: key,
      label: this.formatLabel(key),
      placeholder: prop.description || `Enter ${this.formatLabel(key).toLowerCase()}`,
      required
    };

    const validation: ValidationRule[] = [];
    if (required) {
      validation.push({
        type: 'required',
        value: true,
        message: `${this.formatLabel(key)} is required`
      });
    }

    // Determine component type based on schema
    switch (prop.type) {
      case 'string':
        if (prop.format === 'email') {
          return {
            id: key,
            type: 'input',
            props: { ...baseProps, type: 'email' },
            validation: [
              ...validation,
              {
                type: 'pattern',
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }
            ],
            styling: {
              className: 'form-input email-input'
            }
          };
        } else if (prop.format === 'url') {
          return {
            id: key,
            type: 'input',
            props: { ...baseProps, type: 'url' },
            validation: [
              ...validation,
              {
                type: 'pattern',
                value: /^https?:\/\/.+/,
                message: 'Please enter a valid URL'
              }
            ],
            styling: {
              className: 'form-input url-input'
            }
          };
        } else if (prop.maxLength && prop.maxLength > 100) {
          return {
            id: key,
            type: 'text',
            props: { ...baseProps, rows: 4 },
            validation,
            styling: {
              className: 'form-textarea'
            }
          };
        } else {
          return {
            id: key,
            type: 'input',
            props: { ...baseProps, type: 'text' },
            validation,
            styling: {
              className: 'form-input'
            }
          };
        }

      case 'number':
      case 'integer':
        return {
          id: key,
          type: 'input',
          props: { 
            ...baseProps, 
            type: 'number',
            min: prop.minimum,
            max: prop.maximum,
            step: prop.type === 'integer' ? 1 : 0.01
          },
          validation: [
            ...validation,
            ...(prop.minimum ? [{
              type: 'min',
              value: prop.minimum,
              message: `Value must be at least ${prop.minimum}`
            }] : []),
            ...(prop.maximum ? [{
              type: 'max',
              value: prop.maximum,
              message: `Value must be at most ${prop.maximum}`
            }] : [])
          ],
          styling: {
            className: 'form-input number-input'
          }
        };

      case 'boolean':
        return {
          id: key,
          type: 'input',
          props: { ...baseProps, type: 'checkbox' },
          validation,
          styling: {
            className: 'form-checkbox'
          }
        };

      case 'array':
        return {
          id: key,
          type: 'input',
          props: { 
            ...baseProps, 
            type: 'text',
            placeholder: 'Enter values separated by commas'
          },
          validation,
          styling: {
            className: 'form-input array-input'
          }
        };

      default:
        return {
          id: key,
          type: 'input',
          props: { ...baseProps, type: 'text' },
          validation,
          styling: {
            className: 'form-input'
          }
        };
    }
  }

  /**
   * Generate output components for displaying results
   */
  private generateOutputComponents(agent: Agent): InterfaceComponent[] {
    return [
      {
        id: 'output-container',
        type: 'card',
        props: {
          title: 'Results',
          className: 'output-card'
        },
        children: [
          {
            id: 'output-content',
            type: 'text',
            props: {
              className: 'output-text',
              placeholder: 'Results will appear here...'
            },
            styling: {
              className: 'output-content'
            }
          },
          {
            id: 'output-actions',
            type: 'button',
            props: {
              text: 'Copy Results',
              className: 'copy-button',
              icon: 'copy'
            },
            styling: {
              className: 'action-button secondary'
            }
          }
        ],
        styling: {
          className: 'output-container'
        }
      }
    ];
  }

  /**
   * Generate action components (buttons, etc.)
   */
  private generateActionComponents(agent: Agent): InterfaceComponent[] {
    return [
      {
        id: 'run-button',
        type: 'button',
        props: {
          text: `Run ${agent.name}`,
          className: 'primary-action',
          icon: 'play'
        },
        styling: {
          className: 'primary-button'
        }
      },
      {
        id: 'reset-button',
        type: 'button',
        props: {
          text: 'Reset',
          className: 'secondary-action',
          icon: 'refresh'
        },
        styling: {
          className: 'secondary-button'
        }
      }
    ];
  }

  /**
   * Generate layout structure
   */
  private generateLayout(
    layout: string,
    components: {
      inputs: InterfaceComponent[];
      outputs: InterfaceComponent[];
      actions: InterfaceComponent[];
      features: string[];
    }
  ): InterfaceComponent[] {
    switch (layout) {
      case 'single-column':
        return [
          {
            id: 'main-container',
            type: 'form',
            props: { className: 'single-column-layout' },
            children: [
              {
                id: 'input-section',
                type: 'card',
                props: { title: 'Input Parameters' },
                children: components.inputs
              },
              {
                id: 'action-section',
                type: 'div',
                props: { className: 'action-section' },
                children: components.actions
              },
              {
                id: 'output-section',
                type: 'card',
                props: { title: 'Results' },
                children: components.outputs
              }
            ]
          }
        ];

      case 'two-column':
        return [
          {
            id: 'main-container',
            type: 'div',
            props: { className: 'two-column-layout' },
            children: [
              {
                id: 'left-column',
                type: 'div',
                props: { className: 'left-column' },
                children: [
                  {
                    id: 'input-section',
                    type: 'card',
                    props: { title: 'Input Parameters' },
                    children: components.inputs
                  },
                  {
                    id: 'action-section',
                    type: 'div',
                    props: { className: 'action-section' },
                    children: components.actions
                  }
                ]
              },
              {
                id: 'right-column',
                type: 'div',
                props: { className: 'right-column' },
                children: components.outputs
              }
            ]
          }
        ];

      default:
        return this.generateLayout('single-column', components);
    }
  }

  /**
   * Generate CSS styles based on theme and complexity
   */
  private generateStyles(theme: string, complexity: string): string {
    const baseStyles = `
      .ai-generated-interface {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
      
      .form-input, .form-textarea, .form-checkbox {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.2s;
      }
      
      .form-input:focus, .form-textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .primary-button {
        background: #3b82f6;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .primary-button:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }
      
      .secondary-button {
        background: #6b7280;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .output-container {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        padding: 1.5rem;
        min-height: 200px;
      }
    `;

    const themeStyles = this.getThemeStyles(theme);
    const complexityStyles = this.getComplexityStyles(complexity);

    return `${baseStyles} ${themeStyles} ${complexityStyles}`;
  }

  /**
   * Get theme-specific styles
   */
  private getThemeStyles(theme: string): string {
    switch (theme) {
      case 'modern':
        return `
          .ai-generated-interface {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          
          .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `;

      case 'minimal':
        return `
          .ai-generated-interface {
            background: #fafafa;
          }
          
          .card {
            background: white;
            border: none;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
        `;

      case 'professional':
        return `
          .ai-generated-interface {
            background: #f8fafc;
          }
          
          .card {
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
        `;

      default:
        return '';
    }
  }

  /**
   * Get complexity-specific styles
   */
  private getComplexityStyles(complexity: string): string {
    switch (complexity) {
      case 'advanced':
        return `
          .ai-generated-interface {
            padding: 3rem;
          }
          
          .card {
            padding: 2rem;
            margin-bottom: 2rem;
          }
          
          .form-input, .form-textarea {
            padding: 1rem;
            font-size: 1.1rem;
          }
        `;

      case 'simple':
        return `
          .ai-generated-interface {
            padding: 1rem;
          }
          
          .card {
            padding: 1rem;
            margin-bottom: 0.5rem;
          }
        `;

      default:
        return '';
    }
  }

  /**
   * Generate metadata for the interface
   */
  private generateMetadata(agent: Agent, theme: string) {
    return {
      title: `${agent.name} - AI Interface`,
      description: `Automatically generated interface for ${agent.name}`,
      theme: theme === 'modern' ? 'dark' : 'light' as 'light' | 'dark' | 'auto',
      responsive: true,
      accessibility: true
    };
  }

  /**
   * Format a key into a readable label
   */
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  /**
   * Generate React/Next.js component code for the interface
   */
  async generateReactComponent(generatedInterface: GeneratedInterface): Promise<string> {
    const componentName = `AgentInterface_${generatedInterface.agentId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    return `
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ${componentName}Props {
  agentId: string;
  onResult?: (result: any) => void;
}

export default function ${componentName}({ agentId, onResult }: ${componentName}Props) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(\`/api/agents/\${agentId}/run\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to run agent');
      }

      const data = await response.json();
      setResult(data);
      onResult?.(data);
      toast.success('Agent executed successfully!');
    } catch (error) {
      toast.error('Failed to run agent');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-generated-interface">
      <style jsx>{${JSON.stringify(generatedInterface.styles)}}</style>
      
      <form onSubmit={handleSubmit}>
        ${this.generateJSXFromComponents(generatedInterface.components)}
      </form>
    </div>
  );
}
    `;
  }

  /**
   * Convert interface components to JSX
   */
  private generateJSXFromComponents(components: InterfaceComponent[]): string {
    return components.map(component => this.componentToJSX(component)).join('\n');
  }

  /**
   * Convert a single component to JSX
   */
  private componentToJSX(component: InterfaceComponent): string {
    const props = Object.entries(component.props || {})
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const className = component.styling?.className ? ` className="${component.styling.className}"` : '';

    if (component.children && component.children.length > 0) {
      const childrenJSX = component.children.map(child => this.componentToJSX(child)).join('\n');
      return `<${component.type}${className} ${props}>\n${childrenJSX}\n</${component.type}>`;
    } else {
      return `<${component.type}${className} ${props} />`;
    }
  }
}

export const aiInterfaceGenerator = AIInterfaceGenerator.getInstance(); 