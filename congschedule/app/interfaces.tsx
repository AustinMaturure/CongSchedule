

export interface Talk {
    title: string;
    talk_info: {
      speaker: string;
    }[];
  }
  
  export interface ApplyPart {
    apply_part: string;
    apply_info: {
      student: string;
      duration: string;
    }[];
  }
  
  export interface BibleStudy {
    title: string;
    bible_study_info: {
      conductor: string;
      reader: string;
    }[];
  }
  
  export interface Duties {
    [key: string]: string;
  }
  
  export interface ScheduleSkel {
    Schedule: {
      id: string;
      date: string;
    };
    Opening: {
      opening_song: string;
      opening_prayer: string;
      chairman: string;
    };
    Treasures: {
      bible_reading: string;
      treasures_talks: Talk[];
    };
    "Apply Yourself": {
      apply_parts: ApplyPart[];
    };
    "Living as Christians": {
      living_song: string;
      living_talks: {
        title: string;
        living_talk_info: {
          speaker: string;
          duration: string;
        }[];
      }[];
      bible_study: BibleStudy[];
    };
    Closing: {
      closing_song: string;
      closing_prayer: string;
    };
    Duties: Duties[];
  }
  
  export interface Brother {
    full_name: string;
  }
  
  export interface PublicDiscourse {
    theme: string;
    speaker: {
      brother: Brother;
    };
  }
  
  export interface Watchtower {
    conductor: {
      brother: Brother;
    };
    reader: {
      full_name: string;
    };
  }
  
  export interface ClosingPrayer {
    full_name: string;
  }
  
  export interface WeekendSchedule {
    date: string;
    chairman: {
      brother: Brother;
    };
    public_discourse: PublicDiscourse;
    watchtower: Watchtower;
    closing_prayer: ClosingPrayer;
    duties: Duties[]; 
  }

export interface userInfo {
      first_name: string;
      last_name: string;
      password: string;
    }