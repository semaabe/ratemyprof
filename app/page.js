'use client'
import { Box, Button, Stack, TextField, CircularProgress } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'model',  // Initial message from the model
      parts: [{ text: "Hi! I'm the Rate My Professor support assistant. How can I help you today?" }],
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const currentMessage = message.trim();
    setMessage('');  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', parts: [{ text: currentMessage }] },  // Add user message
      { role: 'model', parts: [{ text: '' }] },  // Placeholder for the assistant's response
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        result += text;

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, parts: [{ text: lastMessage.parts[0].text + text }] },  // Append streamed text
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'model', parts: [{ text: "I'm sorry, but I encountered an error. Please try again later." }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
      <Box
          width="100vw"
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bgcolor="linear-gradient(to right, #000, #000)"  // Vibrant gradient background
      >
        <Stack
            direction={'column'}
            width="90%"
            maxWidth="500px"
            height="80%"
            maxHeight="700px"
            border="1px solid #ddd"
            borderRadius="12px"
            boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
            p={2}
            spacing={3}
            bgcolor="white"
            alignItems="center"
        >
          {/* Image at the top */}
          <Box
              component="img"
              src="/Graduation-Cap.jpg"  // Ensure this path points to the correct location of your image
              alt="Support Assistant"
              sx={{
                width: '100px',  // Adjust the size as needed
                height: '100px',
                borderRadius: '50%',  // Makes the image circular
                objectFit: 'cover',  // Ensures the image covers the box and maintains aspect ratio
                mb: 2
              }}
          />

          <Stack
              direction={'column'}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
              width="100%"
          >
            {messages.map((message, index) => (
                <Box
                    key={index}
                    display="flex"
                    justifyContent={
                      message.role === 'model' ? 'flex-start' : 'flex-end'
                    }
                    alignItems="flex-end"
                >
                  <Box
                      bgcolor={
                        message.role === 'model'
                            ? '#000'
                            : '#000'
                      }
                      color="white"
                      borderRadius={16}
                      boxShadow="#000"
                      p={2}
                      maxWidth="80%"
                  >
                    {message.parts[0].text}  {/* Render message content */}
                  </Box>
                </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>

          <Stack direction={'row'} spacing={2} alignItems="center" width="100%">
            <TextField
                label="Type a message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                variant="outlined"
                sx={{
                  flexGrow: 1,  // Make the input bar take up most of the space
                  borderRadius: '24px',
                }}
                InputProps={{
                  style: { borderRadius: '24px' },
                }}
            />
            <Button
                variant="contained"
                onClick={sendMessage}
                disabled={isLoading}
                sx={{
                  borderRadius: '24px',
                  padding: '12px 24px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  minWidth: '80px',  // Adjust the button width as necessary
                  bgcolor: '#000',  // Match button color with user bubble color
                  '&:hover': {
                    bgcolor: '#25c99d',  // Slightly darker shade on hover
                  }
                }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </Box>
  )

}