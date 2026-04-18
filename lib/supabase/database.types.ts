export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ad_cap: {
        Row: {
          cap_id: string;
          content_id: string;
          created_at: string;
          max_clicks_total: number | null;
          max_impressions_per_user_day: number | null;
          max_impressions_total: number | null;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          cap_id?: string;
          content_id: string;
          created_at?: string;
          max_clicks_total?: number | null;
          max_impressions_per_user_day?: number | null;
          max_impressions_total?: number | null;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          cap_id?: string;
          content_id?: string;
          created_at?: string;
          max_clicks_total?: number | null;
          max_impressions_per_user_day?: number | null;
          max_impressions_total?: number | null;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_cap_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_cap_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_content: {
        Row: {
          ad_image: string | null;
          click_url: string | null;
          content_id: string;
          created_at: string;
          placement_id: string;
          priority: number;
          status: string;
          store_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          ad_image?: string | null;
          click_url?: string | null;
          content_id?: string;
          created_at?: string;
          placement_id: string;
          priority?: number;
          status?: string;
          store_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          ad_image?: string | null;
          click_url?: string | null;
          content_id?: string;
          created_at?: string;
          placement_id?: string;
          priority?: number;
          status?: string;
          store_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_content_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_log: {
        Row: {
          action: string;
          area_key: string;
          content_id: string;
          device_id: string | null;
          ip: string | null;
          log_id: string;
          page: string;
          store_id: string;
          ts: string;
          ua: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          area_key: string;
          content_id: string;
          device_id?: string | null;
          ip?: string | null;
          log_id?: string;
          page: string;
          store_id: string;
          ts?: string;
          ua?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          area_key?: string;
          content_id?: string;
          device_id?: string | null;
          ip?: string | null;
          log_id?: string;
          page?: string;
          store_id?: string;
          ts?: string;
          ua?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_log_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_log_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_schedule: {
        Row: {
          content_id: string;
          dow_mask: string | null;
          end_at: string;
          schedule_id: string;
          start_at: string;
          status: string;
          store_id: string;
          time_end: string | null;
          time_start: string | null;
          timezone: string | null;
          weight: number | null;
        };
        Insert: {
          content_id: string;
          dow_mask?: string | null;
          end_at: string;
          schedule_id?: string;
          start_at: string;
          status?: string;
          store_id: string;
          time_end?: string | null;
          time_start?: string | null;
          timezone?: string | null;
          weight?: number | null;
        };
        Update: {
          content_id?: string;
          dow_mask?: string | null;
          end_at?: string;
          schedule_id?: string;
          start_at?: string;
          status?: string;
          store_id?: string;
          time_end?: string | null;
          time_start?: string | null;
          timezone?: string | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_schedule_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_schedule_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      ad_target: {
        Row: {
          app_version_max: string | null;
          app_version_min: string | null;
          content_id: string;
          locale: string | null;
          os: string | null;
          region: string | null;
          status: string;
          store_id: string;
          target_id: string;
          user_segment: string | null;
        };
        Insert: {
          app_version_max?: string | null;
          app_version_min?: string | null;
          content_id: string;
          locale?: string | null;
          os?: string | null;
          region?: string | null;
          status?: string;
          store_id: string;
          target_id?: string;
          user_segment?: string | null;
        };
        Update: {
          app_version_max?: string | null;
          app_version_min?: string | null;
          content_id?: string;
          locale?: string | null;
          os?: string | null;
          region?: string | null;
          status?: string;
          store_id?: string;
          target_id?: string;
          user_segment?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_target_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "ad_content";
            referencedColumns: ["content_id"];
          },
          {
            foreignKeyName: "fp_ad_target_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      address: {
        Row: {
          address: string;
          address_id: string;
          address_name: string;
          created_at: string;
          customer_id: string;
          message: string;
          modified_at: string;
          status: string;
        };
        Insert: {
          address: string;
          address_id?: string;
          address_name: string;
          created_at?: string;
          customer_id: string;
          message?: string;
          modified_at?: string;
          status?: string;
        };
        Update: {
          address?: string;
          address_id?: string;
          address_name?: string;
          created_at?: string;
          customer_id?: string;
          message?: string;
          modified_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          action: string;
          created_at: string;
          ip: string | null;
          log_id: string;
          payload: Json | null;
          resource: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          ip?: string | null;
          log_id?: string;
          payload?: Json | null;
          resource: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          ip?: string | null;
          log_id?: string;
          payload?: Json | null;
          resource?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      bank_account_verify_log: {
        Row: {
          account_holder: string;
          account_no: string;
          bank_code: string;
          bank_name: string;
          created_at: string;
          response_code: string | null;
          response_message: string | null;
          user_id: string | null;
          verified: boolean;
          verified_at: string | null;
          verify_id: string;
        };
        Insert: {
          account_holder: string;
          account_no: string;
          bank_code: string;
          bank_name: string;
          created_at?: string;
          response_code?: string | null;
          response_message?: string | null;
          user_id?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verify_id?: string;
        };
        Update: {
          account_holder?: string;
          account_no?: string;
          bank_code?: string;
          bank_name?: string;
          created_at?: string;
          response_code?: string | null;
          response_message?: string | null;
          user_id?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verify_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bank_account_verify_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      cart: {
        Row: {
          cartId: string;
          created_at: string;
          customer_id: string;
          item_id: string;
          item_option_id: string | null;
          modified_at: string;
          order_id: string | null;
          quantity: number;
          status: string;
          store_id: string;
        };
        Insert: {
          cartId?: string;
          created_at?: string;
          customer_id: string;
          item_id: string;
          item_option_id?: string | null;
          modified_at?: string;
          order_id?: string | null;
          quantity?: number;
          status?: string;
          store_id: string;
        };
        Update: {
          cartId?: string;
          created_at?: string;
          customer_id?: string;
          item_id?: string;
          item_option_id?: string | null;
          modified_at?: string;
          order_id?: string | null;
          quantity?: number;
          status?: string;
          store_id?: string;
        };
        Relationships: [];
      };
      ceo_review: {
        Row: {
          ceo_reviewId: string;
          content: string | null;
          created_at: string;
          modified_at: string;
          reviewId: string;
          status: string;
        };
        Insert: {
          ceo_reviewId?: string;
          content?: string | null;
          created_at?: string;
          modified_at?: string;
          reviewId: string;
          status?: string;
        };
        Update: {
          ceo_reviewId?: string;
          content?: string | null;
          created_at?: string;
          modified_at?: string;
          reviewId?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ceo_review_reviewId_fkey";
            columns: ["reviewId"];
            isOneToOne: false;
            referencedRelation: "review";
            referencedColumns: ["review_id"];
          },
        ];
      };
      common_code: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      common_code_value: {
        Row: {
          common_code_id: string;
          created_at: string;
          id: string;
          label: string;
          sort_order: number;
          value: string;
        };
        Insert: {
          common_code_id: string;
          created_at?: string;
          id?: string;
          label: string;
          sort_order?: number;
          value: string;
        };
        Update: {
          common_code_id?: string;
          created_at?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "common_code_value_common_code_id_fkey";
            columns: ["common_code_id"];
            isOneToOne: false;
            referencedRelation: "common_code";
            referencedColumns: ["id"];
          },
        ];
      };
      consent: {
        Row: {
          agreed: boolean;
          agreed_at: string | null;
          consent_id: string;
          created_at: string;
          type: string;
          user_id: string;
          version: string | null;
        };
        Insert: {
          agreed?: boolean;
          agreed_at?: string | null;
          consent_id?: string;
          created_at?: string;
          type: string;
          user_id: string;
          version?: string | null;
        };
        Update: {
          agreed?: boolean;
          agreed_at?: string | null;
          consent_id?: string;
          created_at?: string;
          type?: string;
          user_id?: string;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "consent_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      coupon: {
        Row: {
          code: string;
          coupon_id: string;
          coupon_type: string;
          created_at: string;
          discount_unit: string;
          discount_value: number;
          min_order_amount: number;
          modified_at: string;
          name: string;
          per_customer_limit: number;
          shipping_max_free: number;
          stackable: number;
          status: string;
          store_id: string;
          total_issuable: number;
          valid_from: string;
          valid_to: string;
        };
        Insert: {
          code?: string;
          coupon_id?: string;
          coupon_type: string;
          created_at?: string;
          discount_unit: string;
          discount_value: number;
          min_order_amount?: number;
          modified_at?: string;
          name: string;
          per_customer_limit?: number;
          shipping_max_free?: number;
          stackable?: number;
          status?: string;
          store_id: string;
          total_issuable?: number;
          valid_from?: string;
          valid_to: string;
        };
        Update: {
          code?: string;
          coupon_id?: string;
          coupon_type?: string;
          created_at?: string;
          discount_unit?: string;
          discount_value?: number;
          min_order_amount?: number;
          modified_at?: string;
          name?: string;
          per_customer_limit?: number;
          shipping_max_free?: number;
          stackable?: number;
          status?: string;
          store_id?: string;
          total_issuable?: number;
          valid_from?: string;
          valid_to?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      coupon_issurance: {
        Row: {
          coupon_id: string;
          created_at: string;
          customer_id: string | null;
          expires_at: string | null;
          issuance_id: string;
          issued_at: string;
          issued_status: string;
          modified_at: string;
          status: string | null;
        };
        Insert: {
          coupon_id: string;
          created_at?: string;
          customer_id?: string | null;
          expires_at?: string | null;
          issuance_id?: string;
          issued_at?: string;
          issued_status?: string;
          modified_at?: string;
          status?: string | null;
        };
        Update: {
          coupon_id?: string;
          created_at?: string;
          customer_id?: string | null;
          expires_at?: string | null;
          issuance_id?: string;
          issued_at?: string;
          issued_status?: string;
          modified_at?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_issurance_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupon";
            referencedColumns: ["coupon_id"];
          },
        ];
      };
      coupon_redemption: {
        Row: {
          created_at: string;
          discount_amount: number;
          issuance_id: string;
          modified_at: string;
          order_id: string;
          redemption_id: string;
          status: string;
          used_at: string;
        };
        Insert: {
          created_at?: string;
          discount_amount: number;
          issuance_id: string;
          modified_at?: string;
          order_id: string;
          redemption_id?: string;
          status?: string;
          used_at?: string;
        };
        Update: {
          created_at?: string;
          discount_amount?: number;
          issuance_id?: string;
          modified_at?: string;
          order_id?: string;
          redemption_id?: string;
          status?: string;
          used_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_redemption_issuance_id_fkey";
            columns: ["issuance_id"];
            isOneToOne: false;
            referencedRelation: "coupon_issurance";
            referencedColumns: ["issuance_id"];
          },
          {
            foreignKeyName: "coupon_redemption_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
        ];
      };
      cs_ticket: {
        Row: {
          created_at: string;
          cs_action: string;
          cs_contents: string;
          customer_id: string;
          modified_at: string;
          order_id: string;
          status: string;
          ticket_id: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          cs_action?: string;
          cs_contents: string;
          customer_id: string;
          modified_at?: string;
          order_id: string;
          status?: string;
          ticket_id?: string;
          type: string;
        };
        Update: {
          created_at?: string;
          cs_action?: string;
          cs_contents?: string;
          customer_id?: string;
          modified_at?: string;
          order_id?: string;
          status?: string;
          ticket_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cs_ticket_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
        ];
      };
      customer: {
        Row: {
          birthdate: string | null;
          building_name: string | null;
          building_no: string | null;
          created_at: string;
          customer_id: string;
          detail_address: string | null;
          email: string;
          eupmyeondong: string | null;
          gender: string | null;
          grade: string;
          job: string | null;
          location_consent: boolean;
          marketing_optin: boolean;
          modified_at: string | null;
          name: string;
          password_hash: string;
          phone: string;
          privacy_consent: boolean;
          road_name: string | null;
          role: string;
          sido: string | null;
          sigungu: string | null;
          status: string;
          store_id: string | null;
          zipcode: string | null;
        };
        Insert: {
          birthdate?: string | null;
          building_name?: string | null;
          building_no?: string | null;
          created_at?: string;
          customer_id?: string;
          detail_address?: string | null;
          email: string;
          eupmyeondong?: string | null;
          gender?: string | null;
          grade?: string;
          job?: string | null;
          location_consent?: boolean;
          marketing_optin?: boolean;
          modified_at?: string | null;
          name: string;
          password_hash?: string;
          phone?: string;
          privacy_consent?: boolean;
          road_name?: string | null;
          role?: string;
          sido?: string | null;
          sigungu?: string | null;
          status?: string;
          store_id?: string | null;
          zipcode?: string | null;
        };
        Update: {
          birthdate?: string | null;
          building_name?: string | null;
          building_no?: string | null;
          created_at?: string;
          customer_id?: string;
          detail_address?: string | null;
          email?: string;
          eupmyeondong?: string | null;
          gender?: string | null;
          grade?: string;
          job?: string | null;
          location_consent?: boolean;
          marketing_optin?: boolean;
          modified_at?: string | null;
          name?: string;
          password_hash?: string;
          phone?: string;
          privacy_consent?: boolean;
          road_name?: string | null;
          role?: string;
          sido?: string | null;
          sigungu?: string | null;
          status?: string;
          store_id?: string | null;
          zipcode?: string | null;
        };
        Relationships: [];
      };
      customer_shop: {
        Row: {
          created_at: string;
          customer_id: string;
          modified_at: string;
          point_balance: number;
          point_pending: number;
          status: string;
          store_id: string;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          modified_at?: string;
          point_balance?: number;
          point_pending?: number;
          status?: string;
          store_id: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          modified_at?: string;
          point_balance?: number;
          point_pending?: number;
          status?: string;
          store_id?: string;
        };
        Relationships: [];
      };
      device: {
        Row: {
          app_version: string | null;
          device_id: string;
          platform: string;
          push_token: string | null;
          registered_at: string;
          user_id: string;
        };
        Insert: {
          app_version?: string | null;
          device_id?: string;
          platform: string;
          push_token?: string | null;
          registered_at?: string;
          user_id: string;
        };
        Update: {
          app_version?: string | null;
          device_id?: string;
          platform?: string;
          push_token?: string | null;
          registered_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "device_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      dispatch_request: {
        Row: {
          assigned_at: string | null;
          dispatch_id: string;
          order_id: string;
          requested_at: string;
          rider_id: string | null;
          status: string;
          store_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          dispatch_id?: string;
          order_id: string;
          requested_at?: string;
          rider_id?: string | null;
          status?: string;
          store_id: string;
        };
        Update: {
          assigned_at?: string | null;
          dispatch_id?: string;
          order_id?: string;
          requested_at?: string;
          rider_id?: string | null;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dispatch_request_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "dispatch_request_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      fp_ad_placement: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          position: string;
          tenant_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          position: string;
          tenant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          position?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fp_ad_placement_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      inventory: {
        Row: {
          created_at: string;
          inventory_id: string;
          item_id: string;
          modified_at: string;
          on_hand: number;
          reserved: number;
          safety_stock: number;
          status: string;
          store_id: string;
        };
        Insert: {
          created_at?: string;
          inventory_id?: string;
          item_id: string;
          modified_at?: string;
          on_hand?: number;
          reserved?: number;
          safety_stock?: number;
          status?: string;
          store_id: string;
        };
        Update: {
          created_at?: string;
          inventory_id?: string;
          item_id?: string;
          modified_at?: string;
          on_hand?: number;
          reserved?: number;
          safety_stock?: number;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
          {
            foreignKeyName: "inventory_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      inventory_txn: {
        Row: {
          after_quantity: number;
          before_quantity: number;
          created_at: string;
          inventory_id: string;
          item_id: string;
          modified_at: string;
          quantity: number;
          reason: string | null;
          ref_id: string;
          ref_type: string;
          status: string;
          store_id: string;
          txnId: string;
          type: string;
        };
        Insert: {
          after_quantity: number;
          before_quantity: number;
          created_at?: string;
          inventory_id: string;
          item_id: string;
          modified_at?: string;
          quantity: number;
          reason?: string | null;
          ref_id: string;
          ref_type: string;
          status?: string;
          store_id: string;
          txnId?: string;
          type: string;
        };
        Update: {
          after_quantity?: number;
          before_quantity?: number;
          created_at?: string;
          inventory_id?: string;
          item_id?: string;
          modified_at?: string;
          quantity?: number;
          reason?: string | null;
          ref_id?: string;
          ref_type?: string;
          status?: string;
          store_id?: string;
          txnId?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_txn_inventory_id_fkey";
            columns: ["inventory_id"];
            isOneToOne: false;
            referencedRelation: "inventory";
            referencedColumns: ["inventory_id"];
          },
          {
            foreignKeyName: "inventory_txn_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
          {
            foreignKeyName: "inventory_txn_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      item: {
        Row: {
          category_code_value: string;
          category_name: string;
          created_at: string;
          item_id: string;
          item_picture_url: string | null;
          list_price: number;
          modified_at: string;
          name: string;
          ranking: number;
          ranking_yn: string;
          sale_price: number;
          sku: string;
          status: string;
          store_id: string;
        };
        Insert: {
          category_code_value: string;
          category_name: string;
          created_at?: string;
          item_id?: string;
          item_picture_url?: string | null;
          list_price: number;
          modified_at?: string;
          name: string;
          ranking?: number;
          ranking_yn?: string;
          sale_price: number;
          sku: string;
          status?: string;
          store_id: string;
        };
        Update: {
          category_code_value?: string;
          category_name?: string;
          created_at?: string;
          item_id?: string;
          item_picture_url?: string | null;
          list_price?: number;
          modified_at?: string;
          name?: string;
          ranking?: number;
          ranking_yn?: string;
          sale_price?: number;
          sku?: string;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "item_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      item_detail: {
        Row: {
          created_at: string;
          description_short: string | null;
          item_detail_id: string;
          item_detail_img_adv: string | null;
          item_detail_img_detail: string | null;
          item_id: string;
          item_img: string | null;
          item_thumbnail_big: string | null;
          item_thumbnail_small: string | null;
          modified_at: string;
          status: string;
          store_id: string;
        };
        Insert: {
          created_at?: string;
          description_short?: string | null;
          item_detail_id?: string;
          item_detail_img_adv?: string | null;
          item_detail_img_detail?: string | null;
          item_id: string;
          item_img?: string | null;
          item_thumbnail_big?: string | null;
          item_thumbnail_small?: string | null;
          modified_at?: string;
          status?: string;
          store_id: string;
        };
        Update: {
          created_at?: string;
          description_short?: string | null;
          item_detail_id?: string;
          item_detail_img_adv?: string | null;
          item_detail_img_detail?: string | null;
          item_id?: string;
          item_img?: string | null;
          item_thumbnail_big?: string | null;
          item_thumbnail_small?: string | null;
          modified_at?: string;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "item_detail_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
          {
            foreignKeyName: "item_detail_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      label: {
        Row: {
          label_id: string;
          label_type: string;
          order_id: string;
          printed_at: string | null;
          zpl_text: string;
        };
        Insert: {
          label_id?: string;
          label_type: string;
          order_id: string;
          printed_at?: string | null;
          zpl_text: string;
        };
        Update: {
          label_id?: string;
          label_type?: string;
          order_id?: string;
          printed_at?: string | null;
          zpl_text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "label_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
        ];
      };
      memo: {
        Row: {
          ai_context: Json | null;
          created_at: string;
          customer_id: string;
          memo_id: string;
          modified_at: string;
          note: string | null;
          pinned: number;
          status: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          ai_context?: Json | null;
          created_at?: string;
          customer_id: string;
          memo_id?: string;
          modified_at?: string;
          note?: string | null;
          pinned?: number;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          ai_context?: Json | null;
          created_at?: string;
          customer_id?: string;
          memo_id?: string;
          modified_at?: string;
          note?: string | null;
          pinned?: number;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      memo_item: {
        Row: {
          created_at: string;
          item: string | null;
          matched_item_id: string | null;
          matched_payload: Json | null;
          matched_score: number | null;
          memo_id: string;
          memo_item_id: string;
          note: string | null;
          qty: string | null;
          raw_text: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          item?: string | null;
          matched_item_id?: string | null;
          matched_payload?: Json | null;
          matched_score?: number | null;
          memo_id: string;
          memo_item_id?: string;
          note?: string | null;
          qty?: string | null;
          raw_text: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          item?: string | null;
          matched_item_id?: string | null;
          matched_payload?: Json | null;
          matched_score?: number | null;
          memo_id?: string;
          memo_item_id?: string;
          note?: string | null;
          qty?: string | null;
          raw_text?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memo_recipe: {
        Row: {
          cook_time_min: number | null;
          created_at: string;
          memo_id: string;
          recipe_id: string;
          servings: number | null;
          source: string | null;
          status: string;
          steps_json: Json | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          cook_time_min?: number | null;
          created_at?: string;
          memo_id: string;
          recipe_id?: string;
          servings?: number | null;
          source?: string | null;
          status?: string;
          steps_json?: Json | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          cook_time_min?: number | null;
          created_at?: string;
          memo_id?: string;
          recipe_id?: string;
          servings?: number | null;
          source?: string | null;
          status?: string;
          steps_json?: Json | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memo_recipe_ingredient: {
        Row: {
          created_at: string;
          ingredient_id: string;
          matched_item_id: string | null;
          matched_score: number | null;
          name_raw: string;
          optional: number;
          qty_text: string | null;
          recipe_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ingredient_id?: string;
          matched_item_id?: string | null;
          matched_score?: number | null;
          name_raw: string;
          optional?: number;
          qty_text?: string | null;
          recipe_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ingredient_id?: string;
          matched_item_id?: string | null;
          matched_score?: number | null;
          name_raw?: string;
          optional?: number;
          qty_text?: string | null;
          recipe_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      message: {
        Row: {
          content: string;
          content_type: string;
          created_at: string;
          is_read: boolean;
          msg_id: string;
          sender_id: string;
          sender_type: string;
          thread_id: string;
        };
        Insert: {
          content: string;
          content_type?: string;
          created_at?: string;
          is_read?: boolean;
          msg_id?: string;
          sender_id: string;
          sender_type: string;
          thread_id: string;
        };
        Update: {
          content?: string;
          content_type?: string;
          created_at?: string;
          is_read?: boolean;
          msg_id?: string;
          sender_id?: string;
          sender_type?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "message_thread";
            referencedColumns: ["thread_id"];
          },
        ];
      };
      message_thread: {
        Row: {
          created_at: string;
          customer_id: string | null;
          last_message_at: string | null;
          order_id: string;
          rider_id: string | null;
          seller_id: string | null;
          shipment_id: string | null;
          status: string;
          thread_id: string;
        };
        Insert: {
          created_at?: string;
          customer_id?: string | null;
          last_message_at?: string | null;
          order_id: string;
          rider_id?: string | null;
          seller_id?: string | null;
          shipment_id?: string | null;
          status?: string;
          thread_id?: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string | null;
          last_message_at?: string | null;
          order_id?: string;
          rider_id?: string | null;
          seller_id?: string | null;
          shipment_id?: string | null;
          status?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_thread_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "message_thread_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "message_thread_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      notification: {
        Row: {
          body: string;
          channel: string;
          created_at: string;
          noti_id: string;
          sent_at: string | null;
          status: string;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          channel: string;
          created_at?: string;
          noti_id?: string;
          sent_at?: string | null;
          status?: string;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          channel?: string;
          created_at?: string;
          noti_id?: string;
          sent_at?: string | null;
          status?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      oauth_token: {
        Row: {
          access_token: string;
          created_at: string;
          expires_at: string | null;
          provider: string;
          refresh_token: string | null;
          token_id: string;
          user_id: string;
        };
        Insert: {
          access_token: string;
          created_at?: string;
          expires_at?: string | null;
          provider: string;
          refresh_token?: string | null;
          token_id?: string;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          expires_at?: string | null;
          provider?: string;
          refresh_token?: string | null;
          token_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oauth_token_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      order: {
        Row: {
          address_id: string | null;
          created_at: string;
          customer_id: string;
          delivery_fee: number;
          delivery_method: string | null;
          delivery_price: number;
          discounted_total_price: number;
          final_payable: number;
          modified_at: string;
          order_id: string;
          order_no: string;
          order_price: number;
          ordered_at: string;
          origin_total_price: number;
          paid_at: string | null;
          payment_id: string | null;
          points_earned: number;
          points_redeemed: number;
          points_value_redeemed: number;
          quick_depart_date: string | null;
          quick_depart_time: string | null;
          requests: string | null;
          ro_rider_id: string | null;
          status: string;
          store_id: string;
        };
        Insert: {
          address_id?: string | null;
          created_at?: string;
          customer_id: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          delivery_price: number;
          discounted_total_price: number;
          final_payable: number;
          modified_at?: string;
          order_id?: string;
          order_no: string;
          order_price: number;
          ordered_at?: string;
          origin_total_price: number;
          paid_at?: string | null;
          payment_id?: string | null;
          points_earned?: number;
          points_redeemed?: number;
          points_value_redeemed?: number;
          quick_depart_date?: string | null;
          quick_depart_time?: string | null;
          requests?: string | null;
          ro_rider_id?: string | null;
          status?: string;
          store_id: string;
        };
        Update: {
          address_id?: string | null;
          created_at?: string;
          customer_id?: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          delivery_price?: number;
          discounted_total_price?: number;
          final_payable?: number;
          modified_at?: string;
          order_id?: string;
          order_no?: string;
          order_price?: number;
          ordered_at?: string;
          origin_total_price?: number;
          paid_at?: string | null;
          payment_id?: string | null;
          points_earned?: number;
          points_redeemed?: number;
          points_value_redeemed?: number;
          quick_depart_date?: string | null;
          quick_depart_time?: string | null;
          requests?: string | null;
          ro_rider_id?: string | null;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      order_item: {
        Row: {
          created_at: string;
          discount: number | null;
          item_id: string;
          line_total: number;
          order_detail_id: string;
          order_id: string;
          qty: number;
          shipped_qty: number | null;
          status: string;
          unit_price: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          discount?: number | null;
          item_id: string;
          line_total: number;
          order_detail_id?: string;
          order_id: string;
          qty: number;
          shipped_qty?: number | null;
          status?: string;
          unit_price: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          discount?: number | null;
          item_id?: string;
          line_total?: number;
          order_detail_id?: string;
          order_id?: string;
          qty?: number;
          shipped_qty?: number | null;
          status?: string;
          unit_price?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_item_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
          {
            foreignKeyName: "order_item_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
        ];
      };
      otp_request: {
        Row: {
          created_at: string;
          expires_at: string;
          name: string;
          otp_code: string;
          otp_id: string;
          phone: string;
          request_ip: string | null;
          verified: boolean;
          verified_at: string | null;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          name: string;
          otp_code: string;
          otp_id?: string;
          phone: string;
          request_ip?: string | null;
          verified?: boolean;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          name?: string;
          otp_code?: string;
          otp_id?: string;
          phone?: string;
          request_ip?: string | null;
          verified?: boolean;
          verified_at?: string | null;
        };
        Relationships: [];
      };
      packing_task: {
        Row: {
          completed_at: string | null;
          order_id: string;
          pack_id: string;
          packer_id: string | null;
          packing_weight: number | null;
          status: string;
        };
        Insert: {
          completed_at?: string | null;
          order_id: string;
          pack_id?: string;
          packer_id?: string | null;
          packing_weight?: number | null;
          status?: string;
        };
        Update: {
          completed_at?: string | null;
          order_id?: string;
          pack_id?: string;
          packer_id?: string | null;
          packing_weight?: number | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "packing_task_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "packing_task_packer_id_fkey";
            columns: ["packer_id"];
            isOneToOne: false;
            referencedRelation: "seller";
            referencedColumns: ["seller_id"];
          },
        ];
      };
      payment: {
        Row: {
          approved_at: string | null;
          created_at: string;
          delivery_fee: number;
          delivery_method: string | null;
          net_paid_amount: number;
          order_id: string;
          paid_amount: number;
          payment_id: string;
          payment_method: string;
          pg_tx_id: string | null;
          points_used: number;
          status: string;
        };
        Insert: {
          approved_at?: string | null;
          created_at?: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          net_paid_amount?: number;
          order_id: string;
          paid_amount?: number;
          payment_id?: string;
          payment_method?: string;
          pg_tx_id?: string | null;
          points_used?: number;
          status?: string;
        };
        Update: {
          approved_at?: string | null;
          created_at?: string;
          delivery_fee?: number;
          delivery_method?: string | null;
          net_paid_amount?: number;
          order_id?: string;
          paid_amount?: number;
          payment_id?: string;
          payment_method?: string;
          pg_tx_id?: string | null;
          points_used?: number;
          status?: string;
        };
        Relationships: [];
      };
      picking_item: {
        Row: {
          memo: string | null;
          order_item_id: string;
          picked_qty: number;
          picking_item_id: string;
          requested_qty: number;
          result: string;
          substitute_product_id: string | null;
          task_id: string;
        };
        Insert: {
          memo?: string | null;
          order_item_id: string;
          picked_qty?: number;
          picking_item_id?: string;
          requested_qty: number;
          result?: string;
          substitute_product_id?: string | null;
          task_id: string;
        };
        Update: {
          memo?: string | null;
          order_item_id?: string;
          picked_qty?: number;
          picking_item_id?: string;
          requested_qty?: number;
          result?: string;
          substitute_product_id?: string | null;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "picking_item_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_item";
            referencedColumns: ["order_detail_id"];
          },
          {
            foreignKeyName: "picking_item_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "picking_task";
            referencedColumns: ["task_id"];
          },
        ];
      };
      picking_task: {
        Row: {
          completed_at: string | null;
          created_at: string;
          order_id: string;
          picker_id: string | null;
          status: string;
          store_id: string;
          task_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          order_id: string;
          picker_id?: string | null;
          status?: string;
          store_id: string;
          task_id?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          order_id?: string;
          picker_id?: string | null;
          status?: string;
          store_id?: string;
          task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "picking_task_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "picking_task_picker_id_fkey";
            columns: ["picker_id"];
            isOneToOne: false;
            referencedRelation: "seller";
            referencedColumns: ["seller_id"];
          },
          {
            foreignKeyName: "picking_task_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      promotion: {
        Row: {
          bundle_price: number | null;
          created_at: string;
          discount_unit: string | null;
          discount_value: number | null;
          end_at: string;
          flash_dow_mask: string | null;
          flash_enabled: number;
          flash_time_end: string | null;
          flash_time_start: string | null;
          max_usage: number | null;
          name: string;
          per_user_limit: number | null;
          priority: number;
          promo_id: string;
          stackable: number;
          start_at: string;
          status: string;
          store_id: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          bundle_price?: number | null;
          created_at?: string;
          discount_unit?: string | null;
          discount_value?: number | null;
          end_at: string;
          flash_dow_mask?: string | null;
          flash_enabled?: number;
          flash_time_end?: string | null;
          flash_time_start?: string | null;
          max_usage?: number | null;
          name: string;
          per_user_limit?: number | null;
          priority?: number;
          promo_id?: string;
          stackable?: number;
          start_at: string;
          status?: string;
          store_id: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          bundle_price?: number | null;
          created_at?: string;
          discount_unit?: string | null;
          discount_value?: number | null;
          end_at?: string;
          flash_dow_mask?: string | null;
          flash_enabled?: number;
          flash_time_end?: string | null;
          flash_time_start?: string | null;
          max_usage?: number | null;
          name?: string;
          per_user_limit?: number | null;
          priority?: number;
          promo_id?: string;
          stackable?: number;
          start_at?: string;
          status?: string;
          store_id?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promotion_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      promotion_item: {
        Row: {
          condition_qty: number | null;
          created_at: string;
          id: string;
          item_id: string;
          limit_per_order: number | null;
          promo_id: string;
          reward_item_id: string | null;
          reward_qty: number | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          condition_qty?: number | null;
          created_at?: string;
          id?: string;
          item_id: string;
          limit_per_order?: number | null;
          promo_id: string;
          reward_item_id?: string | null;
          reward_qty?: number | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          condition_qty?: number | null;
          created_at?: string;
          id?: string;
          item_id?: string;
          limit_per_order?: number | null;
          promo_id?: string;
          reward_item_id?: string | null;
          reward_qty?: number | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "promotion_item_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
          {
            foreignKeyName: "promotion_item_promo_id_fkey";
            columns: ["promo_id"];
            isOneToOne: false;
            referencedRelation: "promotion";
            referencedColumns: ["promo_id"];
          },
          {
            foreignKeyName: "promotion_item_reward_item_id_fkey";
            columns: ["reward_item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
        ];
      };
      review: {
        Row: {
          content: string | null;
          created_at: string;
          customer_id: string;
          item_id: string | null;
          modified_at: string;
          rating: number;
          review_id: string;
          review_picture_url: string | null;
          status: string;
          store_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          customer_id: string;
          item_id?: string | null;
          modified_at?: string;
          rating: number;
          review_id?: string;
          review_picture_url?: string | null;
          status?: string;
          store_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          customer_id?: string;
          item_id?: string | null;
          modified_at?: string;
          rating?: number;
          review_id?: string;
          review_picture_url?: string | null;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "item";
            referencedColumns: ["item_id"];
          },
          {
            foreignKeyName: "review_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      seller: {
        Row: {
          created_at: string;
          email: string;
          is_active: string;
          name: string;
          phone: string | null;
          role: string;
          seller_id: string;
          store_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          is_active?: string;
          name: string;
          phone?: string | null;
          role: string;
          seller_id?: string;
          store_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          is_active?: string;
          name?: string;
          phone?: string | null;
          role?: string;
          seller_id?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seller_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      shipment: {
        Row: {
          delivery_fee: number;
          depart_date: string | null;
          depart_time: string | null;
          eta_max: number | null;
          eta_min: number | null;
          method: string;
          order_id: string;
          quote_id: string | null;
          rider_id: string | null;
          shipment_id: string;
          status: string;
          store_id: string | null;
          tracking_no: string | null;
          updated_at: string;
        };
        Insert: {
          delivery_fee?: number;
          depart_date?: string | null;
          depart_time?: string | null;
          eta_max?: number | null;
          eta_min?: number | null;
          method: string;
          order_id: string;
          quote_id?: string | null;
          rider_id?: string | null;
          shipment_id?: string;
          status?: string;
          store_id?: string | null;
          tracking_no?: string | null;
          updated_at?: string;
        };
        Update: {
          delivery_fee?: number;
          depart_date?: string | null;
          depart_time?: string | null;
          eta_max?: number | null;
          eta_min?: number | null;
          method?: string;
          order_id?: string;
          quote_id?: string | null;
          rider_id?: string | null;
          shipment_id?: string;
          status?: string;
          store_id?: string | null;
          tracking_no?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipment_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "order";
            referencedColumns: ["order_id"];
          },
          {
            foreignKeyName: "shipment_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      shipment_event: {
        Row: {
          created_at: string;
          event_code: string;
          event_id: string;
          memo: string | null;
          metadata: Json | null;
          shipment_id: string;
        };
        Insert: {
          created_at?: string;
          event_code: string;
          event_id?: string;
          memo?: string | null;
          metadata?: Json | null;
          shipment_id: string;
        };
        Update: {
          created_at?: string;
          event_code?: string;
          event_id?: string;
          memo?: string | null;
          metadata?: Json | null;
          shipment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shipment_event_shipment_id_fkey";
            columns: ["shipment_id"];
            isOneToOne: false;
            referencedRelation: "shipment";
            referencedColumns: ["shipment_id"];
          },
        ];
      };
      store: {
        Row: {
          accrual_rate_pct: number | null;
          address: string;
          ceo_name: string;
          closed_days: string | null;
          contnet: string | null;
          contract_end_at: string;
          contract_start_at: string;
          created_at: string;
          delivery_address: string | null;
          delivery_tip: number;
          dibs_count: number;
          expire_after_days: number | null;
          fee: number;
          jumin_number: string;
          max_delivery_time: number | null;
          max_redeem_amount: number | null;
          max_redeem_rate_pct: number | null;
          min_delivery_price: number;
          min_delivery_time: number | null;
          min_redeem_unit: number | null;
          modified_at: string;
          name: string;
          operation_hours: string | null;
          phone: string;
          points_enabled: number;
          rating: number;
          redeem_enabled: number;
          reg_code: string;
          reg_number: string;
          review_count: number;
          rounding_mode: string | null;
          status: string;
          store_category: string;
          store_id: string;
          store_picture: string | null;
          tenant_id: string;
        };
        Insert: {
          accrual_rate_pct?: number | null;
          address: string;
          ceo_name: string;
          closed_days?: string | null;
          contnet?: string | null;
          contract_end_at: string;
          contract_start_at: string;
          created_at?: string;
          delivery_address?: string | null;
          delivery_tip: number;
          dibs_count?: number;
          expire_after_days?: number | null;
          fee: number;
          jumin_number: string;
          max_delivery_time?: number | null;
          max_redeem_amount?: number | null;
          max_redeem_rate_pct?: number | null;
          min_delivery_price: number;
          min_delivery_time?: number | null;
          min_redeem_unit?: number | null;
          modified_at?: string;
          name: string;
          operation_hours?: string | null;
          phone: string;
          points_enabled?: number;
          rating?: number;
          redeem_enabled?: number;
          reg_code?: string;
          reg_number: string;
          review_count?: number;
          rounding_mode?: string | null;
          status?: string;
          store_category: string;
          store_id?: string;
          store_picture?: string | null;
          tenant_id: string;
        };
        Update: {
          accrual_rate_pct?: number | null;
          address?: string;
          ceo_name?: string;
          closed_days?: string | null;
          contnet?: string | null;
          contract_end_at?: string;
          contract_start_at?: string;
          created_at?: string;
          delivery_address?: string | null;
          delivery_tip?: number;
          dibs_count?: number;
          expire_after_days?: number | null;
          fee?: number;
          jumin_number?: string;
          max_delivery_time?: number | null;
          max_redeem_amount?: number | null;
          max_redeem_rate_pct?: number | null;
          min_delivery_price?: number;
          min_delivery_time?: number | null;
          min_redeem_unit?: number | null;
          modified_at?: string;
          name?: string;
          operation_hours?: string | null;
          phone?: string;
          points_enabled?: number;
          rating?: number;
          redeem_enabled?: number;
          reg_code?: string;
          reg_number?: string;
          review_count?: number;
          rounding_mode?: string | null;
          status?: string;
          store_category?: string;
          store_id?: string;
          store_picture?: string | null;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      store_fulfillment: {
        Row: {
          active: boolean;
          created_at: string;
          fulfillment_type: string;
          id: string;
          store_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          fulfillment_type: string;
          id?: string;
          store_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          fulfillment_type?: string;
          id?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_fulfillment_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_quick_policy: {
        Row: {
          capacity_per_slot: number;
          created_at: string;
          daily_runs: number;
          min_order_amount: number;
          policy_id: string;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          capacity_per_slot?: number;
          created_at?: string;
          daily_runs?: number;
          min_order_amount?: number;
          policy_id?: string;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          capacity_per_slot?: number;
          created_at?: string;
          daily_runs?: number;
          min_order_amount?: number;
          policy_id?: string;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_policy_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_quick_slot_usage: {
        Row: {
          depart_date: string;
          depart_time: string;
          reserved_count: number;
          store_id: string;
          usage_id: string;
        };
        Insert: {
          depart_date: string;
          depart_time: string;
          reserved_count?: number;
          store_id: string;
          usage_id?: string;
        };
        Update: {
          depart_date?: string;
          depart_time?: string;
          reserved_count?: number;
          store_id?: string;
          usage_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_slot_usage_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_quick_time_slot: {
        Row: {
          created_at: string | null;
          day_type: string | null;
          depart_time: string;
          schedule_id: string;
          status: string;
          store_id: string;
        };
        Insert: {
          created_at?: string | null;
          day_type?: string | null;
          depart_time: string;
          schedule_id?: string;
          status?: string;
          store_id: string;
        };
        Update: {
          created_at?: string | null;
          day_type?: string | null;
          depart_time?: string;
          schedule_id?: string;
          status?: string;
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_time_slot_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      store_quick_timeslot: {
        Row: {
          created_at: string;
          depart_time: string;
          dow_mask: string | null;
          label: string;
          order_cutoff_min: number;
          slot_id: string;
          status: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          depart_time: string;
          dow_mask?: string | null;
          label: string;
          order_cutoff_min?: number;
          slot_id?: string;
          status?: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          depart_time?: string;
          dow_mask?: string | null;
          label?: string;
          order_cutoff_min?: number;
          slot_id?: string;
          status?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "store_quick_timeslot_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "store";
            referencedColumns: ["store_id"];
          },
        ];
      };
      tenant: {
        Row: {
          code: string;
          created_at: string;
          name: string;
          status: string;
          tenant_id: string;
          type: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          name: string;
          status?: string;
          tenant_id?: string;
          type?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          name?: string;
          status?: string;
          tenant_id?: string;
          type?: string;
        };
        Relationships: [];
      };
      user_login_log: {
        Row: {
          created_at: string;
          fail_reason: string | null;
          log_id: string;
          login_ip: string | null;
          success: boolean;
          user_agent: string | null;
          user_id: string | null;
          user_role: string | null;
        };
        Insert: {
          created_at?: string;
          fail_reason?: string | null;
          log_id?: string;
          login_ip?: string | null;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string | null;
          user_role?: string | null;
        };
        Update: {
          created_at?: string;
          fail_reason?: string | null;
          log_id?: string;
          login_ip?: string | null;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string | null;
          user_role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_login_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      users: {
        Row: {
          active: boolean;
          auth_user_id: string | null;
          created_at: string;
          email: string;
          name: string;
          password_hash: string | null;
          phone: string | null;
          role: string;
          tenant_id: string | null;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          auth_user_id?: string | null;
          created_at?: string;
          email: string;
          name: string;
          password_hash?: string | null;
          phone?: string | null;
          role: string;
          tenant_id?: string | null;
          user_id?: string;
        };
        Update: {
          active?: boolean;
          auth_user_id?: string | null;
          created_at?: string;
          email?: string;
          name?: string;
          password_hash?: string | null;
          phone?: string | null;
          role?: string;
          tenant_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      wishlist: {
        Row: {
          created_at: string;
          customer_id: string;
          item_id: string;
          modified_at: string;
          quantity: number;
          status: string;
          store_id: string;
        };
        Insert: {
          created_at?: string;
          customer_id: string;
          item_id: string;
          modified_at?: string;
          quantity?: number;
          status?: string;
          store_id: string;
        };
        Update: {
          created_at?: string;
          customer_id?: string;
          item_id?: string;
          modified_at?: string;
          quantity?: number;
          status?: string;
          store_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
