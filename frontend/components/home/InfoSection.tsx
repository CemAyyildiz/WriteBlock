import Link from 'next/link';
import { Shield, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export default function InfoSection() {
  return (
    <div className="mt-24">
      <Separator className="mb-12 bg-gray-200" />
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 max-w-2xl">
          <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-4 tracking-tight">
            About WriteBlock
          </h3>
          <p className="text-base text-gray-600 mb-8 leading-relaxed font-light">
            WriteBlock is a decentralized publishing platform built on Sui blockchain with Walrus storage. 
            Every story is permanently stored, censorship-resistant, and truly owned by its creator.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="default" className="rounded-full gap-2">
              <Link href="/author">
                <PenTool className="w-4 h-4" strokeWidth={1.5} />
                <span>Start Writing</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="default" className="rounded-full gap-2">
              <Link href="/admin">
                <Shield className="w-4 h-4" strokeWidth={1.5} />
                <span>Admin Panel</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

