import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, School, ExternalLink } from "lucide-react";
import childhoodRegretPoemAsset from "@/assets/childhood-regret-poem.webp.asset.json";
import { useSeo } from "@/hooks/useSeo";

const childhoodRegretPoem = childhoodRegretPoemAsset.url;

const Features = () => {
  useSeo(
    "Features | Academix Research Network",
    "Research profiles, publications, verified professor directory, private messaging and Academix AI — everything students need to grow a research career.",
  );

  return (
    <div className="min-h-screen">
      {/* Featured Work */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-accent text-accent-foreground">
                  ⭐ Editor's Pick
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 text-accent">🖋️</div>
                  <Badge variant="outline" className="text-xs">
                    Poetry
                  </Badge>
                </div>
                
                <CardTitle className="font-serif text-xl mb-2">
                  The Regret of Not Appreciating Childhood Until It's Gone
                </CardTitle>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Abdullah Amir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4" />
                    <span>Scarsdale</span>
                  </div>
                </div>

              </CardHeader>
              
              <CardContent>
                <a href="https://bit.ly/43y79OM" target="_blank" rel="noopener noreferrer" className="block mb-4">
                  <img 
                    src={childhoodRegretPoem}
                    width={1024}
                    height={1536}
                    
                    alt="The Regret of Not Appreciating Childhood Until It's Gone"
                    loading="lazy"
                    decoding="async"
                    className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  />
                </a>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="https://bit.ly/43y79OM" target="_blank" rel="noopener noreferrer">
                    Read More
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
