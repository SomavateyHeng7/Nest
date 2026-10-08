import Link from "next/link";

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/data/dashboard";

export default function ProfilePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Your profile</h1>
      <DashboardTabs />

      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-heading text-lg font-semibold text-foreground">{currentUser.name}</p>
                {currentUser.isSuperhost && <Badge variant="secondary">Superhost</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">Member since {currentUser.joinedYear}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Full name</span>
              <Input defaultValue={currentUser.name} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Email</span>
              <Input defaultValue={currentUser.email} type="email" />
            </label>
          </div>

          <div>
            <Button className="bg-accent-terracotta text-white hover:bg-accent-terracotta/90">
              Save changes
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Demo only — changes here aren&apos;t saved anywhere.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-fit" nativeButton={false} render={<Link href="/" />}>
        Log out
      </Button>
    </div>
  );
}
