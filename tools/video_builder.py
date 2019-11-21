import os, math, random, json, subprocess, json
from shutil import rmtree
class Builder:
    def __init__(self):
        self.extensions = ['mov', 'mp4', 'mp4', 'm4v', 'avi', 'webm', 'mkv']
        self.input_file = input('Please specify the input:\t').strip()
        self.ext = os.path.splitext(self.input_file)[1][1:]
        if self.ext not in self.extensions: print('Unsupported input..', self.ext); os._exit(0)
        self.split_size = int(input('Split size (perfect square): '))
        #self.resolution = int(input('Resolution: '))
        #self.filters = int(input('Apply filters (0/1): '))
        self.rclen = int(math.sqrt(self.split_size))
        out = self.build_ffmpeg(True)
        #print(out)
        #print(out.replace(";", ";"))
        self.ext = "mp4"
        #print('ffmpeg -i '+self.input_file+' -vn -acodec copy -c:a flac -y -threads 4 -strict -2 out.flac')
        #print('../sox out.flac fast.flac tempo 0.5 32 30 30')
        #print("Audio portion done fast.flac")
        self.filters = True
        self.vp9 = False
        if not self.vp9:
            codec = "-c:v libx264 -crf 0" # -shortest -movflags faststart -threads 4
        else:
            codec = "-c:v libvpx-vp9 -crf 0 -speed 4"
        if self.filters:
            os.system('ffmpeg -i '+self.input_file+' -filter:v "hflip, vflip, lutrgb=r=negval:g=negval:b=negval, hue=h=90" '+codec+' -b:v 0 -threads 4 -y out.'+self.ext);
            #os.system('ffmpeg -i '+self.input_file+' -t 30 -filter:v "scale=2560x1440, hflip, vflip, lutrgb=r=negval:g=negval:b=negval, hue=h=90" -b:v 9000k -deadline best -lossless 1  -minrate 4500k -maxrate 13050k -tile-columns 3 -g 240 -threads 16  -quality good -crf 0 -c:v libvpx-vp9 -c:a libopus -speed 4 -y out.'+self.ext)
            self.input_file = 'out.'+self.ext
        os.system('ffmpeg -i '+self.input_file+' -filter_complex "'+out+'" '+codec+' -b:v 0 -threads 4 -y final.'+self.ext) #-preset slow
        #cmd = """
        #ffmpeg -y -i """+self.input_file+""" -filter_complex \""""+out+"""\" -c:v libx264 -b:v 2600k -threads 4 -pass 1 -an -f mp4 /dev/null && \
        #ffmpeg -i """+self.input_file+""" -filter_complex \""""+out+"""\" -c:v libx264 -b:v 2600k -threads 4 -pass 2 -c:a aac -b:a 128k -y final."""+self.ext
        #os.system(cmd);
        #print('ffmpeg -i final.'+self.ext+' -i fast.flac -strict -2 -map 0:0 -map 1:0 -y -c:v libx265 -crf 18 -q 0 -threads 4 -shortest -movflags faststart merged.mp4')
        #print("Processing complete, ", self.key)
        print("---------------------------------------------")
        #reversek(self.key)
        jD = {
          "InstallThisExtension": 'https://chrome.google.com/webstore/detail/mediaflare/epigelmkcmddoagfjomhemkalbbbpkja',
          "title": "Untitled Mediafire",
          "desc": "An untitled mediafire video.",
          "keys": self.key,
          "rate": 1,
          "filter": True,
          "audio": False
        }
        print(json.dumps(jD))

    def chunks(self, l, n):
        for i in range(0, len(l), n):
            yield l[i:i+n]

    def build_ffmpeg(self, mix=True):
        f = '[0]split='+str(self.split_size)
        for i in range(1, self.split_size+1): f += '[p'+str(i).zfill(2)+']'
        f += ';'
        s = 0; e = 0; l = []
        for i in range(1, self.split_size+1):
            if s == self.rclen: s = 0; e+=1
            f += '[p'+str(i).zfill(2)+']crop=iw/'+str(self.rclen)+':ih/'+str(self.rclen)+':'+str(s)+'*iw/'+str(self.rclen)+':'+str(e)+'*ih/'+str(self.rclen)+'[p'+str(i).zfill(2)+'];'; s+=1
        plist = []
        xz = list(range(1, self.split_size+1))
        self.key = xz
        if mix: random.shuffle(xz);
        for i in xz: plist.append('[p'+str(i).zfill(2)+']')
        for i,row in enumerate(list(self.chunks(plist, self.rclen))):
            f += "".join(row) + "hstack="+str(self.rclen)+"[c"+str(i+1).zfill(2)+"];"
        for i in range(0, self.rclen):
            f+="[c"+str(i+1).zfill(2)+"]"
        f+="vstack="+str(self.rclen)
        return f

def reversek(keys):
    beg = '''ffmpeg -i final.mp4 -t 30 -filter_complex "[0]split=16[p01][p02][p03][p04][p05][p06][p07][p08][p09][p10][p11][p12][p13][p14][p15][p16];
    [p01]crop=iw/4:ih/4:0*iw/4:0*ih/4[p01];
    [p02]crop=iw/4:ih/4:1*iw/4:0*ih/4[p02];
    [p03]crop=iw/4:ih/4:2*iw/4:0*ih/4[p03];
    [p04]crop=iw/4:ih/4:3*iw/4:0*ih/4[p04];
    [p05]crop=iw/4:ih/4:0*iw/4:1*ih/4[p05];
    [p06]crop=iw/4:ih/4:1*iw/4:1*ih/4[p06];
    [p07]crop=iw/4:ih/4:2*iw/4:1*ih/4[p07];
    [p08]crop=iw/4:ih/4:3*iw/4:1*ih/4[p08];
    [p09]crop=iw/4:ih/4:0*iw/4:2*ih/4[p09];
    [p10]crop=iw/4:ih/4:1*iw/4:2*ih/4[p10];
    [p11]crop=iw/4:ih/4:2*iw/4:2*ih/4[p11];
    [p12]crop=iw/4:ih/4:3*iw/4:2*ih/4[p12];
    [p13]crop=iw/4:ih/4:0*iw/4:3*ih/4[p13];
    [p14]crop=iw/4:ih/4:1*iw/4:3*ih/4[p14];
    [p15]crop=iw/4:ih/4:2*iw/4:3*ih/4[p15];
    [p16]crop=iw/4:ih/4:3*iw/4:3*ih/4[p16];'''
    new = []
    kay = {}
    i = 1;
    print(beg, end="")
    for k in keys:
        new.append([i,k]); i+=1;
    for o in new:
        kay[o[1]] = o[0]
    data = ""
    c = 0; ct = 1
    for k,v in kay.items():
        if c != 0 and c % 4 == 0:
            data += "hstack=4[c"+str(ct).zfill(2)+"];";
            ct+=1
        data += "[p"+str(v).zfill(2)+"]"
        c+=1
    data += "hstack=4[c"+str(ct).zfill(2)+"];";
    data += "[c01][c02][c03][c04]vstack=4\""
    print(data, end="")
    print(" -y -c:v libx264 -crf 0 -q 0 -threads 4  -f matroska - | ffplay -")

ffmpeg = Builder()
