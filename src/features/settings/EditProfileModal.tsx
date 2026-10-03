import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "./useProfile";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { profile, firm, updateProfile, isUpdating } = useProfile();
  const [formData, setFormData] = useState({
    designation: "",
    barCouncilId: "",
    phone: "",
    bio: "",
    practiceAreas: "",
    firmName: "",
    firmRole: "",
    enrolmentYear: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        designation: profile.designation || "",
        barCouncilId: profile.barCouncilId || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        practiceAreas: (profile.practiceAreas || []).join(", "),
        firmName: firm.name || "",
        firmRole: firm.role || "",
        enrolmentYear: profile.enrolmentYear || "",
      });
    }
  }, [open, profile, firm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      designation: formData.designation,
      bar_council_id: formData.barCouncilId,
      phone: formData.phone,
      bio: formData.bio,
      practice_areas: formData.practiceAreas.split(",").map(s => s.trim()).filter(Boolean),
      firm_name: formData.firmName,
      firm_role: formData.firmRole,
      enrolment_year: formData.enrolmentYear,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barCouncilId">Bar Council ID</Label>
              <Input
                id="barCouncilId"
                value={formData.barCouncilId}
                onChange={(e) => setFormData({ ...formData, barCouncilId: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrolmentYear">Enrolment Year</Label>
              <Input
                id="enrolmentYear"
                value={formData.enrolmentYear}
                onChange={(e) => setFormData({ ...formData, enrolmentYear: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practiceAreas">Practice Areas (comma separated)</Label>
            <Input
              id="practiceAreas"
              value={formData.practiceAreas}
              onChange={(e) => setFormData({ ...formData, practiceAreas: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firmName">Firm/Chamber Name</Label>
              <Input
                id="firmName"
                value={formData.firmName}
                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firmRole">Role at Firm</Label>
              <Input
                id="firmRole"
                value={formData.firmRole}
                onChange={(e) => setFormData({ ...formData, firmRole: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
