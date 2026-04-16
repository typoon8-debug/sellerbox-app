export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      // ─── 관리자 사용자 ────────────────────────────────────────────
      users: {
        Row: {
          user_id: string;
          email: string;
          phone: string | null;
          password_hash: string | null;
          name: string;
          role: "CUSTOMER" | "SELLER" | "RIDER" | "ADMIN";
          tenant_id: string | null;
          active: boolean;
          created_at: string;
          auth_user_id: string | null;
        };
        Insert: {
          user_id?: string;
          email: string;
          phone?: string | null;
          password_hash?: string | null;
          name: string;
          role: "CUSTOMER" | "SELLER" | "RIDER" | "ADMIN";
          tenant_id?: string | null;
          active?: boolean;
          created_at?: string;
          auth_user_id?: string | null;
        };
        Update: {
          user_id?: string;
          email?: string;
          phone?: string | null;
          password_hash?: string | null;
          name?: string;
          role?: "CUSTOMER" | "SELLER" | "RIDER" | "ADMIN";
          tenant_id?: string | null;
          active?: boolean;
          created_at?: string;
          auth_user_id?: string | null;
        };
        Relationships: [];
      };

      // ─── 감사 로그 ────────────────────────────────────────────────
      audit_log: {
        Row: {
          id: number;
          user_id: string;
          action: string;
          resource: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          action: string;
          resource: string;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          action?: string;
          resource?: string;
          payload?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // ─── 테넌트 ───────────────────────────────────────────────────
      tenant: {
        Row: {
          tenant_id: string;
          name: string;
          code: string;
          type: string;
          status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
          created_at: string;
        };
        Insert: {
          tenant_id?: string;
          name: string;
          code: string;
          type?: string;
          status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
          created_at?: string;
        };
        Update: {
          tenant_id?: string;
          name?: string;
          code?: string;
          type?: string;
          status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
          created_at?: string;
        };
        Relationships: [];
      };

      // ─── 가게 ─────────────────────────────────────────────────────
      store: {
        Row: {
          store_id: string;
          tenant_id: string;
          name: string;
          store_category: string;
          address: string;
          store_picture: string | null;
          phone: string;
          contnet: string | null;
          min_delivery_price: number;
          delivery_tip: number;
          min_delivery_time: number | null;
          max_delivery_time: number | null;
          points_enabled: number;
          accrual_rate_pct: number | null;
          redeem_enabled: number;
          min_redeem_unit: number | null;
          max_redeem_rate_pct: number | null;
          max_redeem_amount: number | null;
          expire_after_days: number | null;
          rounding_mode: string | null;
          rating: number;
          dibs_count: number;
          review_count: number;
          operation_hours: string | null;
          closed_days: string | null;
          delivery_dddress: string | null;
          reg_number: string;
          jumin_number: string;
          ceo_name: string;
          reg_code: string;
          fee: number;
          contract_start_at: string;
          contract_end_at: string;
          created_at: string;
          modified_at: string;
          status: "ACTIVE" | "INACTIVE" | "CLOSED" | "PENDING";
        };
        Insert: {
          store_id?: string;
          tenant_id: string;
          name: string;
          store_category: string;
          address: string;
          store_picture?: string | null;
          phone: string;
          contnet?: string | null;
          min_delivery_price: number;
          delivery_tip: number;
          min_delivery_time?: number | null;
          max_delivery_time?: number | null;
          points_enabled?: number;
          accrual_rate_pct?: number | null;
          redeem_enabled?: number;
          min_redeem_unit?: number | null;
          max_redeem_rate_pct?: number | null;
          max_redeem_amount?: number | null;
          expire_after_days?: number | null;
          rounding_mode?: string | null;
          rating?: number;
          dibs_count?: number;
          review_count?: number;
          operation_hours?: string | null;
          closed_days?: string | null;
          delivery_dddress?: string | null;
          reg_number: string;
          jumin_number: string;
          ceo_name: string;
          reg_code?: string;
          fee: number;
          contract_start_at: string;
          contract_end_at: string;
          created_at?: string;
          modified_at?: string;
          status?: "ACTIVE" | "INACTIVE" | "CLOSED" | "PENDING";
        };
        Update: {
          store_id?: string;
          tenant_id?: string;
          name?: string;
          store_category?: string;
          address?: string;
          store_picture?: string | null;
          phone?: string;
          contnet?: string | null;
          min_delivery_price?: number;
          delivery_tip?: number;
          min_delivery_time?: number | null;
          max_delivery_time?: number | null;
          points_enabled?: number;
          accrual_rate_pct?: number | null;
          redeem_enabled?: number;
          min_redeem_unit?: number | null;
          max_redeem_rate_pct?: number | null;
          max_redeem_amount?: number | null;
          expire_after_days?: number | null;
          rounding_mode?: string | null;
          rating?: number;
          dibs_count?: number;
          review_count?: number;
          operation_hours?: string | null;
          closed_days?: string | null;
          delivery_dddress?: string | null;
          reg_number?: string;
          jumin_number?: string;
          ceo_name?: string;
          reg_code?: string;
          fee?: number;
          contract_start_at?: string;
          contract_end_at?: string;
          created_at?: string;
          modified_at?: string;
          status?: "ACTIVE" | "INACTIVE" | "CLOSED" | "PENDING";
        };
        Relationships: [];
      };

      // ─── 가게 풀필먼트 ────────────────────────────────────────────
      store_fulfillment: {
        Row: {
          id: string;
          store_id: string;
          fulfillment_type:
            | "DELIVERY"
            | "PICKUP"
            | "BBQ"
            | "RESERVE"
            | "FRESH_MORNING"
            | "SAME_DAY"
            | "3P_DELIVERY"
            | "NONE";
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          fulfillment_type:
            | "DELIVERY"
            | "PICKUP"
            | "BBQ"
            | "RESERVE"
            | "FRESH_MORNING"
            | "SAME_DAY"
            | "3P_DELIVERY"
            | "NONE";
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          fulfillment_type?:
            | "DELIVERY"
            | "PICKUP"
            | "BBQ"
            | "RESERVE"
            | "FRESH_MORNING"
            | "SAME_DAY"
            | "3P_DELIVERY"
            | "NONE";
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      // ─── 판매원 ───────────────────────────────────────────────────
      seller: {
        Row: {
          seller_id: string;
          email: string;
          name: string;
          phone: string | null;
          role: "OWNER" | "MANAGER" | "PICKER" | "PACKER";
          store_id: string;
          created_at: string;
          is_active: "ACTIVE" | "INACTIVE";
        };
        Insert: {
          seller_id?: string;
          email: string;
          name: string;
          phone?: string | null;
          role: "OWNER" | "MANAGER" | "PICKER" | "PACKER";
          store_id: string;
          created_at?: string;
          is_active?: "ACTIVE" | "INACTIVE";
        };
        Update: {
          seller_id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          role?: "OWNER" | "MANAGER" | "PICKER" | "PACKER";
          store_id?: string;
          created_at?: string;
          is_active?: "ACTIVE" | "INACTIVE";
        };
        Relationships: [];
      };

      // ─── 상품 ─────────────────────────────────────────────────────
      item: {
        Row: {
          item_id: string;
          store_id: string;
          sku: string;
          category_code_value: string;
          category_name: string;
          name: string;
          list_price: number;
          sale_price: number;
          item_picture_url: string | null;
          ranking_yn: string;
          ranking: number;
          created_at: string;
          modified_at: string;
          status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
        };
        Insert: {
          item_id?: string;
          store_id: string;
          sku: string;
          category_code_value: string;
          category_name: string;
          name: string;
          list_price: number;
          sale_price: number;
          item_picture_url?: string | null;
          ranking_yn?: string;
          ranking?: number;
          created_at?: string;
          modified_at?: string;
          status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
        };
        Update: {
          item_id?: string;
          store_id?: string;
          sku?: string;
          category_code_value?: string;
          category_name?: string;
          name?: string;
          list_price?: number;
          sale_price?: number;
          item_picture_url?: string | null;
          ranking_yn?: string;
          ranking?: number;
          created_at?: string;
          modified_at?: string;
          status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";
        };
        Relationships: [];
      };

      // ─── 상품 상세 ────────────────────────────────────────────────
      item_detail: {
        Row: {
          item_detail_id: string;
          item_id: string;
          store_id: string;
          description_short: string | null;
          item_img: string | null;
          item_thumbnail_small: string | null;
          item_thumbnail_big: string | null;
          item_detail_img_adv: string | null;
          item_detail_img_detail: string | null;
          created_at: string;
          modified_at: string;
          status: "ACTIVE" | "INACTIVE";
        };
        Insert: {
          item_detail_id?: string;
          item_id: string;
          store_id: string;
          description_short?: string | null;
          item_img?: string | null;
          item_thumbnail_small?: string | null;
          item_thumbnail_big?: string | null;
          item_detail_img_adv?: string | null;
          item_detail_img_detail?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "ACTIVE" | "INACTIVE";
        };
        Update: {
          item_detail_id?: string;
          item_id?: string;
          store_id?: string;
          description_short?: string | null;
          item_img?: string | null;
          item_thumbnail_small?: string | null;
          item_thumbnail_big?: string | null;
          item_detail_img_adv?: string | null;
          item_detail_img_detail?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "ACTIVE" | "INACTIVE";
        };
        Relationships: [];
      };

      // ─── 재고 ─────────────────────────────────────────────────────
      inventory: {
        Row: {
          inventory_id: string;
          store_id: string;
          item_id: string;
          on_hand: number;
          reserved: number;
          safety_stock: number;
          created_at: string;
          modified_at: string;
          status: "AVAILABLE" | "RESERVED" | "DAMAGED" | "ADJUSTED";
        };
        Insert: {
          inventory_id?: string;
          store_id: string;
          item_id: string;
          on_hand?: number;
          reserved?: number;
          safety_stock?: number;
          created_at?: string;
          modified_at?: string;
          status?: "AVAILABLE" | "RESERVED" | "DAMAGED" | "ADJUSTED";
        };
        Update: {
          inventory_id?: string;
          store_id?: string;
          item_id?: string;
          on_hand?: number;
          reserved?: number;
          safety_stock?: number;
          created_at?: string;
          modified_at?: string;
          status?: "AVAILABLE" | "RESERVED" | "DAMAGED" | "ADJUSTED";
        };
        Relationships: [];
      };

      // ─── 재고 트랜잭션 ────────────────────────────────────────────
      inventory_txn: {
        Row: {
          txnId: string;
          inventory_id: string;
          item_id: string;
          store_id: string;
          type: "INBOUND" | "OUTBOUND" | "ADJUST" | "RESERVE" | "RELEASE" | "RETURN";
          ref_type: string;
          ref_id: string;
          quantity: number;
          before_quantity: number;
          after_quantity: number;
          reason: string | null;
          created_at: string;
          modified_at: string;
          status: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";
        };
        Insert: {
          txnId?: string;
          inventory_id: string;
          item_id: string;
          store_id: string;
          type: "INBOUND" | "OUTBOUND" | "ADJUST" | "RESERVE" | "RELEASE" | "RETURN";
          ref_type: string;
          ref_id: string;
          quantity: number;
          before_quantity: number;
          after_quantity: number;
          reason?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";
        };
        Update: {
          txnId?: string;
          inventory_id?: string;
          item_id?: string;
          store_id?: string;
          type?: "INBOUND" | "OUTBOUND" | "ADJUST" | "RESERVE" | "RELEASE" | "RETURN";
          ref_type?: string;
          ref_id?: string;
          quantity?: number;
          before_quantity?: number;
          after_quantity?: number;
          reason?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";
        };
        Relationships: [];
      };

      // ─── 주문 ─────────────────────────────────────────────────────
      order: {
        Row: {
          order_id: string;
          store_id: string;
          customer_id: string;
          address_id: string | null;
          order_no: string;
          payment_id: string | null;
          ordered_at: string;
          paid_at: string | null;
          discounted_total_price: number;
          origin_total_price: number;
          delivery_method:
            | "DELIVERY"
            | "BBQ"
            | "PICKUP"
            | "RESERVE"
            | "FRESH_MORNING"
            | "SAME_DAY"
            | "3P_DELIVERY"
            | null;
          quick_depart_date: string | null;
          quick_depart_time: string | null;
          ro_rider_id: string | null;
          delivery_fee: number;
          delivery_price: number;
          order_price: number;
          points_earned: number;
          points_redeemed: number;
          points_value_redeemed: number;
          final_payable: number;
          requests: string | null;
          created_at: string;
          modified_at: string;
          status:
            | "CREATED"
            | "PAID"
            | "PACKING"
            | "DISPATCHED"
            | "DELIVERING"
            | "DELIVERED"
            | "CANCELED"
            | "REFUNDED";
        };
        Insert: {
          order_id?: string;
          store_id: string;
          customer_id: string;
          address_id?: string | null;
          order_no: string;
          payment_id?: string | null;
          ordered_at?: string;
          paid_at?: string | null;
          discounted_total_price: number;
          origin_total_price: number;
          delivery_method?:
            | "DELIVERY"
            | "BBQ"
            | "PICKUP"
            | "RESERVE"
            | "FRESH_MORNING"
            | "SAME_DAY"
            | "3P_DELIVERY"
            | null;
          quick_depart_date?: string | null;
          quick_depart_time?: string | null;
          ro_rider_id?: string | null;
          delivery_fee?: number;
          delivery_price: number;
          order_price: number;
          points_earned?: number;
          points_redeemed?: number;
          points_value_redeemed?: number;
          final_payable: number;
          requests?: string | null;
          created_at?: string;
          modified_at?: string;
          status?:
            | "CREATED"
            | "PAID"
            | "PACKING"
            | "DISPATCHED"
            | "DELIVERING"
            | "DELIVERED"
            | "CANCELED"
            | "REFUNDED";
        };
        Update: {
          order_id?: string;
          store_id?: string;
          customer_id?: string;
          address_id?: string | null;
          order_no?: string;
          payment_id?: string | null;
          ordered_at?: string;
          paid_at?: string | null;
          discounted_total_price?: number;
          origin_total_price?: number;
          delivery_method?:
            | "DELIVERY"
            | "BBQ"
            | "PICKUP"
            | "RESERVE"
            | "FRESH_MORNING"
            | "SAME_DAY"
            | "3P_DELIVERY"
            | null;
          quick_depart_date?: string | null;
          quick_depart_time?: string | null;
          ro_rider_id?: string | null;
          delivery_fee?: number;
          delivery_price?: number;
          order_price?: number;
          points_earned?: number;
          points_redeemed?: number;
          points_value_redeemed?: number;
          final_payable?: number;
          requests?: string | null;
          created_at?: string;
          modified_at?: string;
          status?:
            | "CREATED"
            | "PAID"
            | "PACKING"
            | "DISPATCHED"
            | "DELIVERING"
            | "DELIVERED"
            | "CANCELED"
            | "REFUNDED";
        };
        Relationships: [];
      };

      // ─── 주문 상품 ────────────────────────────────────────────────
      order_item: {
        Row: {
          order_detail_id: string;
          order_id: string;
          item_id: string;
          qty: number;
          unit_price: number;
          discount: number | null;
          line_total: number;
          status: "ORDERED" | "PACKING" | "SHIPPED" | "DELIVERED" | "CANCELED";
          shipped_qty: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          order_detail_id?: string;
          order_id: string;
          item_id: string;
          qty: number;
          unit_price: number;
          discount?: number | null;
          line_total: number;
          status?: "ORDERED" | "PACKING" | "SHIPPED" | "DELIVERED" | "CANCELED";
          shipped_qty?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          order_detail_id?: string;
          order_id?: string;
          item_id?: string;
          qty?: number;
          unit_price?: number;
          discount?: number | null;
          line_total?: number;
          status?: "ORDERED" | "PACKING" | "SHIPPED" | "DELIVERED" | "CANCELED";
          shipped_qty?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      // ─── 피킹 작업 ────────────────────────────────────────────────
      picking_task: {
        Row: {
          task_id: string;
          order_id: string;
          store_id: string;
          picker_id: string | null;
          status: "CREATED" | "PICKING" | "PICKED" | "FAILED";
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          task_id?: string;
          order_id: string;
          store_id: string;
          picker_id?: string | null;
          status?: "CREATED" | "PICKING" | "PICKED" | "FAILED";
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          task_id?: string;
          order_id?: string;
          store_id?: string;
          picker_id?: string | null;
          status?: "CREATED" | "PICKING" | "PICKED" | "FAILED";
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };

      // ─── 피킹 상품 ────────────────────────────────────────────────
      picking_item: {
        Row: {
          picking_item_id: string;
          task_id: string;
          order_item_id: string;
          requested_qty: number;
          picked_qty: number;
          result: "OK" | "SHORT" | "SUBSTITUTE";
          substitute_product_id: string | null;
          memo: string | null;
        };
        Insert: {
          picking_item_id?: string;
          task_id: string;
          order_item_id: string;
          requested_qty: number;
          picked_qty?: number;
          result?: "OK" | "SHORT" | "SUBSTITUTE";
          substitute_product_id?: string | null;
          memo?: string | null;
        };
        Update: {
          picking_item_id?: string;
          task_id?: string;
          order_item_id?: string;
          requested_qty?: number;
          picked_qty?: number;
          result?: "OK" | "SHORT" | "SUBSTITUTE";
          substitute_product_id?: string | null;
          memo?: string | null;
        };
        Relationships: [];
      };

      // ─── 패킹 작업 ────────────────────────────────────────────────
      packing_task: {
        Row: {
          pack_id: string;
          order_id: string;
          packer_id: string | null;
          status: "READY" | "PACKING" | "PACKED";
          packing_weight: number | null;
          completed_at: string | null;
        };
        Insert: {
          pack_id?: string;
          order_id: string;
          packer_id?: string | null;
          status?: "READY" | "PACKING" | "PACKED";
          packing_weight?: number | null;
          completed_at?: string | null;
        };
        Update: {
          pack_id?: string;
          order_id?: string;
          packer_id?: string | null;
          status?: "READY" | "PACKING" | "PACKED";
          packing_weight?: number | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };

      // ─── 라벨 ─────────────────────────────────────────────────────
      label: {
        Row: {
          label_id: string;
          order_id: string;
          zpl_text: string;
          label_type: "BOX" | "BAG" | "INVOICE";
          printed_at: string | null;
        };
        Insert: {
          label_id?: string;
          order_id: string;
          zpl_text: string;
          label_type: "BOX" | "BAG" | "INVOICE";
          printed_at?: string | null;
        };
        Update: {
          label_id?: string;
          order_id?: string;
          zpl_text?: string;
          label_type?: "BOX" | "BAG" | "INVOICE";
          printed_at?: string | null;
        };
        Relationships: [];
      };

      // ─── 배송 ─────────────────────────────────────────────────────
      shipment: {
        Row: {
          shipment_id: string;
          order_id: string;
          tracking_no: string | null;
          method: "QUICK" | "RO_ONDEMAND";
          store_id: string | null;
          depart_date: string | null;
          depart_time: string | null;
          eta_min: number | null;
          eta_max: number | null;
          delivery_fee: number;
          quote_id: string | null;
          status:
            | "READY"
            | "ASSIGNED"
            | "PICKED_UP"
            | "OUT_FOR_DELIVERY"
            | "DELIVERED"
            | "FAILED"
            | "SCHEDULED";
          rider_id: string | null;
          updated_at: string;
        };
        Insert: {
          shipment_id?: string;
          order_id: string;
          tracking_no?: string | null;
          method: "QUICK" | "RO_ONDEMAND";
          store_id?: string | null;
          depart_date?: string | null;
          depart_time?: string | null;
          eta_min?: number | null;
          eta_max?: number | null;
          delivery_fee?: number;
          quote_id?: string | null;
          status?:
            | "READY"
            | "ASSIGNED"
            | "PICKED_UP"
            | "OUT_FOR_DELIVERY"
            | "DELIVERED"
            | "FAILED"
            | "SCHEDULED";
          rider_id?: string | null;
          updated_at?: string;
        };
        Update: {
          shipment_id?: string;
          order_id?: string;
          tracking_no?: string | null;
          method?: "QUICK" | "RO_ONDEMAND";
          store_id?: string | null;
          depart_date?: string | null;
          depart_time?: string | null;
          eta_min?: number | null;
          eta_max?: number | null;
          delivery_fee?: number;
          quote_id?: string | null;
          status?:
            | "READY"
            | "ASSIGNED"
            | "PICKED_UP"
            | "OUT_FOR_DELIVERY"
            | "DELIVERED"
            | "FAILED"
            | "SCHEDULED";
          rider_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── 배송 이벤트 ──────────────────────────────────────────────
      shipment_event: {
        Row: {
          event_id: string;
          shipment_id: string;
          event_code:
            | "ASSIGNED"
            | "OUT"
            | "ARRIVED"
            | "FAILED"
            | "PROOF_UPLOADED"
            | "SCHEDULED"
            | "VEHICLE_DEPARTED";
          memo: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          event_id?: string;
          shipment_id: string;
          event_code:
            | "ASSIGNED"
            | "OUT"
            | "ARRIVED"
            | "FAILED"
            | "PROOF_UPLOADED"
            | "SCHEDULED"
            | "VEHICLE_DEPARTED";
          memo?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          shipment_id?: string;
          event_code?:
            | "ASSIGNED"
            | "OUT"
            | "ARRIVED"
            | "FAILED"
            | "PROOF_UPLOADED"
            | "SCHEDULED"
            | "VEHICLE_DEPARTED";
          memo?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // ─── 배송 요청 ────────────────────────────────────────────────
      dispatch_request: {
        Row: {
          dispatch_id: string;
          order_id: string;
          store_id: string;
          status: "REQUESTED" | "ASSIGNED" | "CANCELLED";
          rider_id: string | null;
          requested_at: string;
          assigned_at: string | null;
        };
        Insert: {
          dispatch_id?: string;
          order_id: string;
          store_id: string;
          status?: "REQUESTED" | "ASSIGNED" | "CANCELLED";
          rider_id?: string | null;
          requested_at?: string;
          assigned_at?: string | null;
        };
        Update: {
          dispatch_id?: string;
          order_id?: string;
          store_id?: string;
          status?: "REQUESTED" | "ASSIGNED" | "CANCELLED";
          rider_id?: string | null;
          requested_at?: string;
          assigned_at?: string | null;
        };
        Relationships: [];
      };

      // ─── 바로퀵 정책 ──────────────────────────────────────────────
      store_quick_policy: {
        Row: {
          policy_id: string;
          store_id: string;
          min_order_amount: number;
          daily_runs: number;
          capacity_per_slot: number;
          status: "ACTIVE" | "INACTIVE";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          policy_id?: string;
          store_id: string;
          min_order_amount?: number;
          daily_runs?: number;
          capacity_per_slot?: number;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          policy_id?: string;
          store_id?: string;
          min_order_amount?: number;
          daily_runs?: number;
          capacity_per_slot?: number;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── 바로퀵 타임슬롯 ──────────────────────────────────────────
      store_quick_timeslot: {
        Row: {
          slot_id: string;
          store_id: string;
          label: string;
          depart_time: string;
          order_cutoff_min: number;
          dow_mask: string | null;
          status: "ACTIVE" | "INACTIVE";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slot_id?: string;
          store_id: string;
          label: string;
          depart_time: string;
          order_cutoff_min?: number;
          dow_mask?: string | null;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slot_id?: string;
          store_id?: string;
          label?: string;
          depart_time?: string;
          order_cutoff_min?: number;
          dow_mask?: string | null;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── 바로퀵 슬롯 사용량 ───────────────────────────────────────
      store_quick_slot_usage: {
        Row: {
          usage_id: string;
          store_id: string;
          depart_date: string;
          depart_time: string;
          reserved_count: number;
        };
        Insert: {
          usage_id?: string;
          store_id: string;
          depart_date: string;
          depart_time: string;
          reserved_count?: number;
        };
        Update: {
          usage_id?: string;
          store_id?: string;
          depart_date?: string;
          depart_time?: string;
          reserved_count?: number;
        };
        Relationships: [];
      };

      // ─── 프로모션 ─────────────────────────────────────────────────
      promotion: {
        Row: {
          promo_id: string;
          store_id: string;
          name: string;
          type:
            | "SALE"
            | "DISCOUNT_PCT"
            | "DISCOUNT_FIXED"
            | "ONE_PLUS_ONE"
            | "TWO_PLUS_ONE"
            | "BUNDLE";
          discount_unit: "PCT" | "FIXED" | null;
          discount_value: number | null;
          bundle_price: number | null;
          priority: number;
          stackable: number;
          flash_enabled: number;
          flash_time_start: string | null;
          flash_time_end: string | null;
          flash_dow_mask: string | null;
          max_usage: number | null;
          per_user_limit: number | null;
          start_at: string;
          end_at: string;
          status: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          promo_id?: string;
          store_id: string;
          name: string;
          type:
            | "SALE"
            | "DISCOUNT_PCT"
            | "DISCOUNT_FIXED"
            | "ONE_PLUS_ONE"
            | "TWO_PLUS_ONE"
            | "BUNDLE";
          discount_unit?: "PCT" | "FIXED" | null;
          discount_value?: number | null;
          bundle_price?: number | null;
          priority?: number;
          stackable?: number;
          flash_enabled?: number;
          flash_time_start?: string | null;
          flash_time_end?: string | null;
          flash_dow_mask?: string | null;
          max_usage?: number | null;
          per_user_limit?: number | null;
          start_at: string;
          end_at: string;
          status?: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          promo_id?: string;
          store_id?: string;
          name?: string;
          type?:
            | "SALE"
            | "DISCOUNT_PCT"
            | "DISCOUNT_FIXED"
            | "ONE_PLUS_ONE"
            | "TWO_PLUS_ONE"
            | "BUNDLE";
          discount_unit?: "PCT" | "FIXED" | null;
          discount_value?: number | null;
          bundle_price?: number | null;
          priority?: number;
          stackable?: number;
          flash_enabled?: number;
          flash_time_start?: string | null;
          flash_time_end?: string | null;
          flash_dow_mask?: string | null;
          max_usage?: number | null;
          per_user_limit?: number | null;
          start_at?: string;
          end_at?: string;
          status?: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── 프로모션 상품 ────────────────────────────────────────────
      promotion_item: {
        Row: {
          id: string;
          promo_id: string;
          item_id: string;
          condition_qty: number | null;
          reward_qty: number | null;
          reward_item_id: string | null;
          limit_per_order: number | null;
          status: "ACTIVE" | "INACTIVE";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          promo_id: string;
          item_id: string;
          condition_qty?: number | null;
          reward_qty?: number | null;
          reward_item_id?: string | null;
          limit_per_order?: number | null;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          promo_id?: string;
          item_id?: string;
          condition_qty?: number | null;
          reward_qty?: number | null;
          reward_item_id?: string | null;
          limit_per_order?: number | null;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── 쿠폰 ─────────────────────────────────────────────────────
      coupon: {
        Row: {
          coupon_id: string;
          store_id: string;
          code: string;
          name: string;
          coupon_type: "DISCOUNT" | "SHIPPING_FREE" | "SIGNUP";
          discount_unit: "PCT" | "FIXED";
          discount_value: number;
          shipping_max_free: number;
          min_order_amount: number;
          valid_from: string;
          valid_to: string;
          total_issuable: number;
          per_customer_limit: number;
          stackable: number;
          created_at: string;
          modified_at: string;
          status: "ISSUED" | "USED" | "EXPIRED" | "CANCELLED";
        };
        Insert: {
          coupon_id?: string;
          store_id: string;
          code?: string;
          name: string;
          coupon_type: "DISCOUNT" | "SHIPPING_FREE" | "SIGNUP";
          discount_unit: "PCT" | "FIXED";
          discount_value: number;
          shipping_max_free?: number;
          min_order_amount?: number;
          valid_from?: string;
          valid_to: string;
          total_issuable?: number;
          per_customer_limit?: number;
          stackable?: number;
          created_at?: string;
          modified_at?: string;
          status?: "ISSUED" | "USED" | "EXPIRED" | "CANCELLED";
        };
        Update: {
          coupon_id?: string;
          store_id?: string;
          code?: string;
          name?: string;
          coupon_type?: "DISCOUNT" | "SHIPPING_FREE" | "SIGNUP";
          discount_unit?: "PCT" | "FIXED";
          discount_value?: number;
          shipping_max_free?: number;
          min_order_amount?: number;
          valid_from?: string;
          valid_to?: string;
          total_issuable?: number;
          per_customer_limit?: number;
          stackable?: number;
          created_at?: string;
          modified_at?: string;
          status?: "ISSUED" | "USED" | "EXPIRED" | "CANCELLED";
        };
        Relationships: [];
      };

      // ─── 쿠폰 발급 ────────────────────────────────────────────────
      coupon_issurance: {
        Row: {
          issuance_id: string;
          coupon_id: string;
          customer_id: string | null;
          issued_at: string;
          expires_at: string | null;
          issued_status: "ISSUED" | "USED" | "EXPIRED" | "CANCELLED";
          created_at: string;
          modified_at: string;
          status: string | null;
        };
        Insert: {
          issuance_id?: string;
          coupon_id: string;
          customer_id?: string | null;
          issued_at?: string;
          expires_at?: string | null;
          issued_status?: "ISSUED" | "USED" | "EXPIRED" | "CANCELLED";
          created_at?: string;
          modified_at?: string;
          status?: string | null;
        };
        Update: {
          issuance_id?: string;
          coupon_id?: string;
          customer_id?: string | null;
          issued_at?: string;
          expires_at?: string | null;
          issued_status?: "ISSUED" | "USED" | "EXPIRED" | "CANCELLED";
          created_at?: string;
          modified_at?: string;
          status?: string | null;
        };
        Relationships: [];
      };

      // ─── 쿠폰 사용 ────────────────────────────────────────────────
      coupon_redemption: {
        Row: {
          redemption_id: string;
          issuance_id: string;
          order_id: string;
          used_at: string;
          discount_amount: number;
          created_at: string;
          modified_at: string;
          status: "APPLIED" | "REVOKED" | "FAILED";
        };
        Insert: {
          redemption_id?: string;
          issuance_id: string;
          order_id: string;
          used_at?: string;
          discount_amount: number;
          created_at?: string;
          modified_at?: string;
          status?: "APPLIED" | "REVOKED" | "FAILED";
        };
        Update: {
          redemption_id?: string;
          issuance_id?: string;
          order_id?: string;
          used_at?: string;
          discount_amount?: number;
          created_at?: string;
          modified_at?: string;
          status?: "APPLIED" | "REVOKED" | "FAILED";
        };
        Relationships: [];
      };

      // ─── 광고 콘텐츠 ──────────────────────────────────────────────
      fp_ad_content: {
        Row: {
          content_id: string;
          placement_id: string;
          store_id: string;
          title: string;
          ad_image: string | null;
          click_url: string | null;
          priority: number;
          status: "DRAFT" | "READY" | "ACTIVE" | "PAUSED" | "ENDED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          content_id?: string;
          placement_id: string;
          store_id: string;
          title: string;
          ad_image?: string | null;
          click_url?: string | null;
          priority?: number;
          status?: "DRAFT" | "READY" | "ACTIVE" | "PAUSED" | "ENDED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content_id?: string;
          placement_id?: string;
          store_id?: string;
          title?: string;
          ad_image?: string | null;
          click_url?: string | null;
          priority?: number;
          status?: "DRAFT" | "READY" | "ACTIVE" | "PAUSED" | "ENDED";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── 광고 일정 ────────────────────────────────────────────────
      fp_ad_schedule: {
        Row: {
          schedule_id: string;
          content_id: string;
          store_id: string;
          start_at: string;
          end_at: string;
          time_start: string | null;
          time_end: string | null;
          dow_mask: string | null;
          timezone: string | null;
          status: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
          weight: number | null;
        };
        Insert: {
          schedule_id?: string;
          content_id: string;
          store_id: string;
          start_at: string;
          end_at: string;
          time_start?: string | null;
          time_end?: string | null;
          dow_mask?: string | null;
          timezone?: string | null;
          status?: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
          weight?: number | null;
        };
        Update: {
          schedule_id?: string;
          content_id?: string;
          store_id?: string;
          start_at?: string;
          end_at?: string;
          time_start?: string | null;
          time_end?: string | null;
          dow_mask?: string | null;
          timezone?: string | null;
          status?: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
          weight?: number | null;
        };
        Relationships: [];
      };

      // ─── 광고 타겟 ────────────────────────────────────────────────
      fp_ad_target: {
        Row: {
          target_id: string;
          content_id: string;
          store_id: string;
          os: "IOS" | "ANDROID" | "WEB" | null;
          app_version_min: string | null;
          app_version_max: string | null;
          locale: string | null;
          region: string | null;
          user_segment: string | null;
          status: "ACTIVE" | "INACTIVE";
        };
        Insert: {
          target_id?: string;
          content_id: string;
          store_id: string;
          os?: "IOS" | "ANDROID" | "WEB" | null;
          app_version_min?: string | null;
          app_version_max?: string | null;
          locale?: string | null;
          region?: string | null;
          user_segment?: string | null;
          status?: "ACTIVE" | "INACTIVE";
        };
        Update: {
          target_id?: string;
          content_id?: string;
          store_id?: string;
          os?: "IOS" | "ANDROID" | "WEB" | null;
          app_version_min?: string | null;
          app_version_max?: string | null;
          locale?: string | null;
          region?: string | null;
          user_segment?: string | null;
          status?: "ACTIVE" | "INACTIVE";
        };
        Relationships: [];
      };

      // ─── 광고 한도 ────────────────────────────────────────────────
      fp_ad_cap: {
        Row: {
          cap_id: string;
          content_id: string;
          store_id: string;
          max_impressions_total: number | null;
          max_impressions_per_user_day: number | null;
          max_clicks_total: number | null;
          status: "ACTIVE" | "INACTIVE";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          cap_id?: string;
          content_id: string;
          store_id: string;
          max_impressions_total?: number | null;
          max_impressions_per_user_day?: number | null;
          max_clicks_total?: number | null;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          cap_id?: string;
          content_id?: string;
          store_id?: string;
          max_impressions_total?: number | null;
          max_impressions_per_user_day?: number | null;
          max_clicks_total?: number | null;
          status?: "ACTIVE" | "INACTIVE";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ─── 광고 로그 ────────────────────────────────────────────────
      fp_ad_log: {
        Row: {
          log_id: string;
          content_id: string;
          store_id: string;
          user_id: string | null;
          device_id: string | null;
          action: "IMPRESSION" | "CLICK";
          page: "HOME" | "WEEKLY_SALE";
          area_key: "HERO" | "MID_1" | "MID_2" | "FOOTER";
          ts: string;
          ip: string | null;
          ua: string | null;
        };
        Insert: {
          log_id?: string;
          content_id: string;
          store_id: string;
          user_id?: string | null;
          device_id?: string | null;
          action: "IMPRESSION" | "CLICK";
          page: "HOME" | "WEEKLY_SALE";
          area_key: "HERO" | "MID_1" | "MID_2" | "FOOTER";
          ts?: string;
          ip?: string | null;
          ua?: string | null;
        };
        Update: {
          log_id?: string;
          content_id?: string;
          store_id?: string;
          user_id?: string | null;
          device_id?: string | null;
          action?: "IMPRESSION" | "CLICK";
          page?: "HOME" | "WEEKLY_SALE";
          area_key?: "HERO" | "MID_1" | "MID_2" | "FOOTER";
          ts?: string;
          ip?: string | null;
          ua?: string | null;
        };
        Relationships: [];
      };

      // ─── CS 티켓 ──────────────────────────────────────────────────
      cs_ticket: {
        Row: {
          ticket_id: string;
          order_id: string;
          customer_id: string;
          type: "REFUND" | "EXCHANGE" | "INQUIRY";
          cs_contents: string;
          cs_action: string;
          created_at: string;
          modified_at: string;
          status: "OPEN" | "IN_PROGRESS" | "CLOSED";
        };
        Insert: {
          ticket_id?: string;
          order_id: string;
          customer_id: string;
          type: "REFUND" | "EXCHANGE" | "INQUIRY";
          cs_contents: string;
          cs_action?: string;
          created_at?: string;
          modified_at?: string;
          status?: "OPEN" | "IN_PROGRESS" | "CLOSED";
        };
        Update: {
          ticket_id?: string;
          order_id?: string;
          customer_id?: string;
          type?: "REFUND" | "EXCHANGE" | "INQUIRY";
          cs_contents?: string;
          cs_action?: string;
          created_at?: string;
          modified_at?: string;
          status?: "OPEN" | "IN_PROGRESS" | "CLOSED";
        };
        Relationships: [];
      };

      // ─── 리뷰 ─────────────────────────────────────────────────────
      review: {
        Row: {
          review_id: string;
          store_id: string;
          customer_id: string;
          item_id: string | null;
          rating: number;
          content: string | null;
          review_picture_url: string | null;
          created_at: string;
          modified_at: string;
          status: "VISIBLE" | "HIDDEN" | "REPORTED" | "DELETED";
        };
        Insert: {
          review_id?: string;
          store_id: string;
          customer_id: string;
          item_id?: string | null;
          rating: number;
          content?: string | null;
          review_picture_url?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "VISIBLE" | "HIDDEN" | "REPORTED" | "DELETED";
        };
        Update: {
          review_id?: string;
          store_id?: string;
          customer_id?: string;
          item_id?: string | null;
          rating?: number;
          content?: string | null;
          review_picture_url?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "VISIBLE" | "HIDDEN" | "REPORTED" | "DELETED";
        };
        Relationships: [];
      };

      // ─── CEO 답변 ─────────────────────────────────────────────────
      ceo_review: {
        Row: {
          ceo_reviewId: string;
          reviewId: string;
          content: string | null;
          created_at: string;
          modified_at: string;
          status: "VISIBLE" | "HIDDEN" | "DELETED";
        };
        Insert: {
          ceo_reviewId?: string;
          reviewId: string;
          content?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "VISIBLE" | "HIDDEN" | "DELETED";
        };
        Update: {
          ceo_reviewId?: string;
          reviewId?: string;
          content?: string | null;
          created_at?: string;
          modified_at?: string;
          status?: "VISIBLE" | "HIDDEN" | "DELETED";
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
