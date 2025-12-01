import { useState } from "react";
import { useResearcherData, useCohortMutations } from "@/hooks/useResearcherData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Trash2, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

export default function Cohorts() {
    const { t } = useTranslation();
    const { data, isLoading } = useResearcherData();
    const { createCohort, deleteCohort, addCohortMember, removeCohortMember } = useCohortMutations();
    const [newCohortName, setNewCohortName] = useState("");
    const [newCohortDesc, setNewCohortDesc] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

    const handleCreateCohort = async () => {
        if (!newCohortName) return;
        await createCohort.mutateAsync({ name: newCohortName, description: newCohortDesc });
        setNewCohortName("");
        setNewCohortDesc("");
        setIsCreateDialogOpen(false);
    };

    const handleToggleMember = async (cohortId: string, childId: string, isMember: boolean) => {
        if (isMember) {
            await removeCohortMember.mutateAsync({ cohortId, childId });
        } else {
            await addCohortMember.mutateAsync({ cohortId, childId });
        }
    };

    if (isLoading) {
        return <div>{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{t('researcher.cohorts.title')}</h1>
                        <p className="text-muted-foreground">{t('researcher.cohorts.subtitle')}</p>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('researcher.cohorts.create')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('researcher.cohorts.createTitle')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('researcher.cohorts.nameLabel')}</Label>
                                <Input
                                    id="name"
                                    placeholder={t('researcher.cohorts.namePlaceholder')}
                                    value={newCohortName}
                                    onChange={(e) => setNewCohortName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">{t('researcher.cohorts.descLabel')}</Label>
                                <Input
                                    id="desc"
                                    placeholder={t('researcher.cohorts.descPlaceholder')}
                                    value={newCohortDesc}
                                    onChange={(e) => setNewCohortDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateCohort}>{t('common.add')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data?.cohorts?.map((cohort: any) => (
                    <Card key={cohort.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>{cohort.name}</CardTitle>
                                    <CardDescription>{cohort.description || t('researcher.cohorts.descPlaceholder')}</CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => deleteCohort.mutate(cohort.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{t('researcher.cohorts.members')}: {cohort.cohort_members?.length || 0}</span>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <UserPlus className="h-4 w-4" />
                                                {t('researcher.cohorts.manageMembers')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>{t('researcher.cohorts.manageMembers')} - {cohort.name}</DialogTitle>
                                            </DialogHeader>
                                            <ScrollArea className="h-[300px] pr-4">
                                                <div className="space-y-4">
                                                    {data.consents.map((consent: any) => {
                                                        const child = consent.children;
                                                        const isMember = cohort.cohort_members?.some(
                                                            (m: any) => m.child_id === consent.child_id
                                                        );
                                                        return (
                                                            <div key={consent.child_id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`child-${consent.child_id}`}
                                                                    checked={isMember}
                                                                    onCheckedChange={() =>
                                                                        handleToggleMember(cohort.id, consent.child_id, isMember)
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`child-${consent.child_id}`}
                                                                    className="flex-1 cursor-pointer"
                                                                >
                                                                    {child.name} ({child.age_group})
                                                                </Label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cohort.cohort_members?.map((member: any) => {
                                        const childName = data.consents.find(
                                            (c: any) => c.child_id === member.child_id
                                        )?.children?.name;
                                        return (
                                            <Badge key={member.child_id} variant="secondary">
                                                {childName || "Unknown"}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!data?.cohorts || data.cohorts.length === 0) && (
                    <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        {t('researcher.cohorts.noCohorts')}
                    </div>
                )}
            </div>
        </div>
    );
}
