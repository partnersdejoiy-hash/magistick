/**
 * People photos for the Policy Center, hotlinked from Unsplash's CDN
 * (Unsplash License: free to use, no permission needed). Credits are shown
 * on the Policy Center page.
 */

export const PHOTOS = {
  hero: { id: "photo-1758873268631-fa944fc5cad2", by: "Vitaly Gariev", page: "https://unsplash.com/photos/four-smiling-people-standing-in-a-modern-office-e6rPqzAteII" },
  conduct: { id: "photo-1758520144427-ddb02ac74e9d", by: "Vitaly Gariev", page: "https://unsplash.com/photos/two-women-shaking-hands-across-a-desk-9TF9pMrCFMo" },
  attendance: { id: "photo-1712159018726-4564d92f3ec2", by: "Vagaro", page: "https://unsplash.com/photos/a-man-wearing-a-headset-sitting-in-front-of-a-computer-5skDrjF5EMw" },
  leave: { id: "photo-1639979511514-904e46c8c13f", by: "Anil Sharma", page: "https://unsplash.com/photos/a-man-riding-a-bike-with-two-women-and-a-child-JVmrd83VQMs" },
  security: { id: "photo-1622151834677-70f982c9adef", by: "Christian Velitchkov", page: "https://unsplash.com/photos/man-in-black-long-sleeve-shirt-using-macbook-mXz64B8-3h0" },
  posh: { id: "photo-1758691737568-a1572060ce5a", by: "Vitaly Gariev", page: "https://unsplash.com/photos/diverse-group-of-people-in-a-modern-office-meeting-YyJNda7nsPo" },
  wfh: { id: "photo-1683107695974-98a9fddb249a", by: "Sweet Life", page: "https://unsplash.com/photos/a-woman-sitting-at-a-table-with-a-laptop-TJTw4djEhGg" },
  itUse: { id: "photo-1758612214882-03f8a1d7211f", by: "Vitaly Gariev", page: "https://unsplash.com/photos/hands-typing-on-a-laptop-keyboard-at-a-desk-lMScFOdgRNg" },
  grievance: { id: "photo-1573497491208-6b1acb260507", by: "Christina @ wocintechchat.com", page: "https://unsplash.com/photos/two-women-sitting-beside-table-and-talking-LQ1t-8Ms5PY" },
  support: { id: "photo-1626863905121-3b0c0ed7b94c", by: "Charanjeet Dhiman", page: "https://unsplash.com/photos/women-wearing-headsets-in-workspace-mHusyBu4bxM" },
  teamwork: { id: "photo-1577962917302-cd874c4e31d2", by: "Smartworks Coworking", page: "https://unsplash.com/photos/men-and-women-having-a-meeting-cW4lLTavU80" },
  celebration: { id: "photo-1758691737138-7b9b1884b1db", by: "Vitaly Gariev", page: "https://unsplash.com/photos/diverse-team-celebrating-success-at-office-desk-jPLvaZ06uy0" },
};

export type PhotoKey = keyof typeof PHOTOS;

/** Sized, cropped CDN URL for a photo. */
export function photoUrl(key: PhotoKey, w = 1600): string {
  return `https://images.unsplash.com/${PHOTOS[key].id}?w=${w}&q=80&auto=format&fit=crop`;
}
