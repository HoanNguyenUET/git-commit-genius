import { useState, useEffect, useCallback } from 'react';
import { OllamaService } from '../utils/ollama';
import { formatCommitMessage, determineCommitType } from '../utils/conventional-commits';

const CommitMessageGenerator = () => {
  const [diff, setDiff] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [conventional, setConventional] = useState<boolean>(false);
  const [model, setModel] = useState<string>('llama2');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean>(false);
  const [models, setModels] = useState<string[]>([]);

  const checkOllamaStatus = useCallback(async () => {
    try {
      const available = await OllamaService.isAvailable();
      setOllamaAvailable(available);
      
      if (available) {
        // Use default models for now
        setModels(['llama2', 'codellama', 'mistral']);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setOllamaAvailable(false);
      setModels([]);
    }
  }, []);

  useEffect(() => {
    checkOllamaStatus();
  }, [checkOllamaStatus]);

  const handleGenerateCommitMessage = async () => {
    if (!diff.trim()) {
      setError('Please paste a git diff first');
      return;
    }

    setLoading(true);
    setError('');
    setCommitMessage('');

    try {
      let message = await OllamaService.generateCommitMessage({
        diff,
        conventional,
        model,
        temperature
      });
      
      // Apply conventional commit format if enabled
      if (conventional) {
        const commitType = determineCommitType(diff);
        message = formatCommitMessage(message, commitType);
      }
      
      setCommitMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '800px', 
      padding: '20px',
      boxSizing: 'border-box',
      textAlign: 'left'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🧠 Git Commit Genius Web
      </h1>

      {/* Ollama Status */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        borderRadius: '8px',
        backgroundColor: ollamaAvailable ? '#d4edda' : '#f8d7da',
        border: `1px solid ${ollamaAvailable ? '#c3e6cb' : '#f5c6cb'}`,
        color: ollamaAvailable ? '#155724' : '#721c24'
      }}>
        <strong>Ollama Status: </strong>
        {ollamaAvailable ? '✅ Available' : '❌ Not Available'}
        {!ollamaAvailable && (
          <div style={{ marginTop: '5px', fontSize: '14px' }}>
            Make sure Ollama is running: <code>ollama serve</code>
          </div>
        )}
      </div>

      {/* Configuration */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: '0' }}>Configuration</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Model:
            </label>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              disabled={models.length === 0}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
              {models.length === 0 && (
                <option value="">No models available</option>
              )}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={conventional}
              onChange={(e) => setConventional(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontWeight: 'bold' }}>Use Conventional Commits</span>
          </label>
        </div>
      </div>

      {/* Git Diff Input */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: '0' }}>Git Diff</h3>
        <textarea
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          placeholder="Paste your git diff here...
Example: Run 'git diff --staged' in your terminal and paste the output here."
          style={{
            width: '100%',
            height: '200px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
        
        <button
          onClick={handleGenerateCommitMessage}
          disabled={loading || !diff.trim()}
          style={{
            backgroundColor: loading || !diff.trim() ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: loading || !diff.trim() ? 'not-allowed' : 'pointer',
            marginTop: '15px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '🔄 Generating...' : '✨ Generate Commit Message'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Commit Message Output */}
      {commitMessage && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: '0', color: '#28a745' }}>
            🎉 Generated Commit Message
          </h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #e9ecef',
            fontFamily: 'monospace',
            fontSize: '16px',
            marginBottom: '15px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}>
            {commitMessage}
          </div>
          <button
            onClick={() => copyToClipboard(commitMessage)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '30px',
        fontSize: '14px'
      }}>
        <h4 style={{ marginTop: '0', color: '#495057' }}>💡 How to use:</h4>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Stage your changes: <code>git add .</code></li>
          <li>Get the diff: <code>git diff --staged</code></li>
          <li>Copy and paste the diff output into the text area above</li>
          <li>Configure your preferences and click "Generate Commit Message"</li>
          <li>The AI will analyze your changes and suggest an appropriate commit message</li>
        </ol>
        <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
          <em>Note: This demo uses a rule-based approach. In production, you can integrate with OpenAI, Claude, or other AI services.</em>
        </p>
      </div>
    </div>
  );
};

export default CommitMessageGenerator;
