import { SupabaseClient } from "@supabase/supabase-js";

export class Postbula extends SupabaseClient {
    constructor(publicKey: string, anonKey: string, restUrl: string) {
      super(publicKey, anonKey);
      this.restUrl = restUrl;
    }
  }
  