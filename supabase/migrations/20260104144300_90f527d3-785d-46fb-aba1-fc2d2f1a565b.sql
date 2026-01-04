-- Create services table for marketplace listings
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    cost_cro DECIMAL(10, 4) NOT NULL DEFAULT 0.01,
    category TEXT NOT NULL DEFAULT 'general',
    icon TEXT DEFAULT 'zap',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for the live feed
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    service_name TEXT NOT NULL,
    amount_cro DECIMAL(10, 4) NOT NULL,
    tx_hash TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access (this is a demo/PoC)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Public read access for services
CREATE POLICY "Anyone can view services" 
ON public.services 
FOR SELECT 
USING (true);

-- Public read access for transactions (demo feed)
CREATE POLICY "Anyone can view transactions" 
ON public.transactions 
FOR SELECT 
USING (true);

-- Public insert for transactions (demo purposes)
CREATE POLICY "Anyone can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for transactions feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Seed initial services
INSERT INTO public.services (name, description, provider_id, cost_cro, category, icon) VALUES
('High-Res Image Gen', 'Generate photorealistic images from text prompts using advanced diffusion models', 'Agent-Alpha-7', 0.05, 'AI', 'image'),
('Sentiment Analysis', 'Analyze text sentiment with 98% accuracy. Returns positive, negative, or neutral scores', 'Agent-Omega-3', 0.02, 'NLP', 'brain'),
('Weather Oracle', 'Real-time weather data for any location. Includes forecasts up to 7 days', 'Agent-Weather-1', 0.01, 'Data', 'cloud'),
('Solana Wallet Check', 'Verify wallet balances and recent transactions on Solana network', 'Agent-Chain-9', 0.03, 'Blockchain', 'wallet'),
('Translation API', 'Translate text between 100+ languages with context awareness', 'Agent-Babel-5', 0.015, 'NLP', 'languages'),
('Price Feed Oracle', 'Real-time crypto price feeds with sub-second latency', 'Agent-Oracle-2', 0.005, 'Data', 'trending-up');

-- Seed initial transactions for the live feed
INSERT INTO public.transactions (from_agent, to_agent, service_name, amount_cro, tx_hash, status) VALUES
('Agent-007', 'Agent-Weather-1', 'Weather Oracle', 0.01, '0xabc123...def456', 'completed'),
('Agent-X99', 'Agent-Alpha-7', 'High-Res Image Gen', 0.05, '0x789xyz...123abc', 'completed'),
('Agent-Trader-5', 'Agent-Oracle-2', 'Price Feed Oracle', 0.005, '0xfed987...654cba', 'completed'),
('Agent-NLP-Bot', 'Agent-Omega-3', 'Sentiment Analysis', 0.02, '0x111222...333444', 'completed');