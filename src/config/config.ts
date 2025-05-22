export const config = {
    port: 3000,
    mongoUrl: "mongodb+srv://juanse:paso@cluster0.vrkdwzz.mongodb.net/seplay",
    spotify: {
        clientId: 'f9cbe7c6fa1140b0b53b63c7f2fc817a',
        clientSecret: '799cf82089044af7bfb68e6bcfaa2e72'
    },
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
}; 