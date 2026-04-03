import shutil, os
src = "ThreatLens_ The 60s Bliss Point Walkthrough_720p_caption.mp4"
dst = os.path.join("public", "ThreatLens_ The 60s Bliss Point Walkthrough_720p_caption.mp4")
shutil.move(src, dst)
print("Moved successfully!")
