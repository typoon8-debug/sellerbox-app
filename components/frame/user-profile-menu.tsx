"use client";

import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, User, LogOut, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/actions/profile";

const ROLE_LABEL: Record<UserProfile["role"], string> = {
  ADMIN: "관리자",
  CUSTOMER: "고객",
  SELLER: "판매자",
  RIDER: "배달기사",
};

interface UserProfileMenuProps {
  profile: UserProfile | null;
}

export function UserProfileMenu({ profile }: UserProfileMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.info("로그아웃되었습니다.");
    router.push("/login");
  };

  const themeOptions: { value: string; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "라이트", icon: Sun },
    { value: "dark", label: "다크", icon: Moon },
    { value: "system", label: "시스템", icon: Laptop },
  ];

  const displayName = profile ? `${ROLE_LABEL[profile.role]} ${profile.name}` : "사용자";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2">
          <User className="text-text-placeholder h-4 w-4" />
          <span className="text-text-body text-sm">{displayName}</span>
          <ChevronDown className="text-text-placeholder h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-0">
        {/* 사용자 정보 헤더 */}
        <div className="px-4 py-3">
          <p className="text-text-body text-sm font-semibold">{profile?.name ?? "-"}</p>
          <p className="text-text-placeholder text-xs">{profile ? ROLE_LABEL[profile.role] : ""}</p>
        </div>
        <Separator />

        {/* 테마 전환 */}
        {mounted && (
          <div className="py-1">
            <p className="text-text-placeholder px-4 py-1 text-xs">테마</p>
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`hover:bg-hover text-text-body flex w-full items-center gap-2 px-4 py-2 text-sm ${
                  theme === value ? "text-primary font-medium" : ""
                }`}
              >
                <Icon className="text-text-placeholder h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}
        <Separator />

        <div className="py-1">
          <button
            onClick={handleLogout}
            className="hover:bg-hover text-alert-red flex w-full items-center gap-2 px-4 py-2 text-sm"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
