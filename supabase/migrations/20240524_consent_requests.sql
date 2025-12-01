-- Create consent_requests table for researcher consent management
CREATE TABLE IF NOT EXISTS public.consent_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    researcher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    request_message TEXT,
    response_message TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(researcher_id, parent_id, child_id)
);

-- Enable Row Level Security
ALTER TABLE public.consent_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent_requests

-- Researchers can view their own consent requests
CREATE POLICY "Researchers can view own consent requests" ON public.consent_requests
    FOR SELECT USING (researcher_id = auth.uid());

-- Researchers can create consent requests
CREATE POLICY "Researchers can create consent requests" ON public.consent_requests
    FOR INSERT WITH CHECK (researcher_id = auth.uid());

-- Parents can view consent requests sent to them
CREATE POLICY "Parents can view consent requests" ON public.consent_requests
    FOR SELECT USING (parent_id = auth.uid());

-- Parents can update consent requests (approve/reject)
CREATE POLICY "Parents can respond to consent requests" ON public.consent_requests
    FOR UPDATE USING (parent_id = auth.uid());

-- Admins can view all consent requests
CREATE POLICY "Admins can view all consent requests" ON public.consent_requests
    FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_consent_requests_updated_at
    BEFORE UPDATE ON public.consent_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_consent_requests_researcher_id ON public.consent_requests(researcher_id);
CREATE INDEX idx_consent_requests_parent_id ON public.consent_requests(parent_id);
CREATE INDEX idx_consent_requests_child_id ON public.consent_requests(child_id);
CREATE INDEX idx_consent_requests_status ON public.consent_requests(status);

-- Update existing consents table to link with consent_requests
ALTER TABLE public.consents ADD COLUMN IF NOT EXISTS researcher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.consents ADD COLUMN IF NOT EXISTS granted BOOLEAN DEFAULT FALSE;

-- Create index for researcher_id in consents
CREATE INDEX IF NOT EXISTS idx_consents_researcher_id ON public.consents(researcher_id);

-- Update RLS policy for consents to allow researchers to view approved consents
CREATE POLICY "Researchers can view approved consents" ON public.consents
    FOR SELECT USING (
        researcher_id = auth.uid() AND granted = TRUE
    );
