import type { StripeConnectedAccount, StripeOnboardingSession } from '../../types';
import { supabase } from '../supabase/client';

export interface CreateConnectedAccountParams {
  userId: string;
  email: string;
  country?: string;
  type?: 'express' | 'standard';
}

export interface UpdateConnectedAccountParams {
  accountId: string;
  updates: Partial<StripeConnectedAccount>;
}

/**
 * Creates a Stripe Connect account for a host
 */
export const createConnectedAccount = async (params: CreateConnectedAccountParams): Promise<StripeConnectedAccount> => {
  const { userId, email, country = 'US', type = 'express' } = params;

  try {
    const { data, error } = await supabase.functions.invoke('create-connected-account', {
      body: {
        userId,
        email,
        country,
        type,
      },
    });

    if (error) {
      throw new Error(`Failed to create connected account: ${error.message}`);
    }

    return data.connectedAccount;
  } catch (error) {
    console.error('Error creating connected account:', error);
    throw error;
  }
};

/**
 * Creates an onboarding session for a connected account
 */
export const createAccountOnboardingSession = async (accountId: string): Promise<StripeOnboardingSession> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-account-onboarding', {
      body: { accountId },
    });

    if (error) {
      throw new Error(`Failed to create onboarding session: ${error.message}`);
    }

    return data.onboardingSession;
  } catch (error) {
    console.error('Error creating onboarding session:', error);
    throw error;
  }
};

/**
 * Retrieves connected account details
 */
export const getConnectedAccount = async (accountId: string): Promise<StripeConnectedAccount> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-connected-account', {
      body: { accountId },
    });

    if (error) {
      throw new Error(`Failed to get connected account: ${error.message}`);
    }

    return data.connectedAccount;
  } catch (error) {
    console.error('Error getting connected account:', error);
    throw error;
  }
};

/**
 * Updates connected account information
 */
export const updateConnectedAccount = async (params: UpdateConnectedAccountParams): Promise<StripeConnectedAccount> => {
  const { accountId, updates } = params;

  try {
    const { data, error } = await supabase.functions.invoke('update-connected-account', {
      body: {
        accountId,
        updates,
      },
    });

    if (error) {
      throw new Error(`Failed to update connected account: ${error.message}`);
    }

    return data.connectedAccount;
  } catch (error) {
    console.error('Error updating connected account:', error);
    throw error;
  }
};

/**
 * Deletes a connected account
 */
export const deleteConnectedAccount = async (accountId: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('delete-connected-account', {
      body: { accountId },
    });

    if (error) {
      throw new Error(`Failed to delete connected account: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting connected account:', error);
    throw error;
  }
};

/**
 * Gets connected account by user ID
 */
export const getConnectedAccountByUserId = async (userId: string): Promise<StripeConnectedAccount | null> => {
  try {
    const { data, error } = await supabase
      .from('stripe_connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting connected account by user ID:', error);
    throw error;
  }
};

/**
 * Checks if a user has completed Stripe onboarding
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  try {
    const account = await getConnectedAccountByUserId(userId);
    return account ? account.onboardingComplete && account.chargesEnabled && account.payoutsEnabled : false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Gets account requirements that need to be fulfilled
 */
export const getAccountRequirements = async (accountId: string): Promise<string[]> => {
  try {
    const account = await getConnectedAccount(accountId);
    return [
      ...account.requirements.currently_due,
      ...account.requirements.eventually_due,
      ...account.requirements.pending_verification,
    ];
  } catch (error) {
    console.error('Error getting account requirements:', error);
    throw error;
  }
};

/**
 * Creates account link for updating account information
 */
export const createAccountUpdateLink = async (accountId: string): Promise<StripeOnboardingSession> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-account-update-link', {
      body: { accountId },
    });

    if (error) {
      throw new Error(`Failed to create account update link: ${error.message}`);
    }

    return data.updateSession;
  } catch (error) {
    console.error('Error creating account update link:', error);
    throw error;
  }
};