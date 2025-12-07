# RSC Preservation Policy

## Important: Typos are Features!

This project uses `@2003scape/rsc-server` which is a **preservation project** of the original RuneScape Classic. Many apparent "typos" in the game text are **intentional** and part of the authentic RSC experience.

### Confirmed Original RSC Quirks

The following are **NOT errors** - they are preserved from the original 2003-era game:

1. **Smelting** - "You retrive a bar" (not "retrieve")
2. **Cooking** - "You accidentially burn" (not "accidentally")  
3. **Cook's Assistant Quest** - "You haved gained" (not "have gained")

### Policy

- ✅ **DO** add missing functionality (sounds, features, etc.)
- ❌ **DO NOT** "fix" typos without verifying against @2003scape source first
- 🔍 **ALWAYS** check the original @2003scape plugin source before correcting spelling

### How to Verify

Before "fixing" apparent typos:
1. Check https://github.com/2003scape/rsc-server/blob/master/src/plugins/[module]/[file].js
2. Search RSC Wiki for original game transcripts
3. When in doubt, preserve the existing text

## Lesson Learned

During development, we initially "corrected" these typos, only to discover they were part of the original game's charm. We've since reverted these changes to maintain authenticity.

**Remember**: In preservation projects, even mistakes are historically significant!
