from datetime import timedelta

def toSeconds(delta):
    return delta.days * 24 * 60 * 60 + delta.seconds + delta.microseconds / 1000000

def parseLogEntry(line):
    timestamp, interface, message = line.split(' ')
    seconds, microseconds = timestamp.strip('()').split('.')
    messageId, text = message.split('#')
    entry = LogEntry(
        delta=timedelta(seconds=int(seconds), microseconds=int(microseconds)),
        interface=interface,
        messageId=messageId,
        message=text
    )
    return entry

class LogEntry:
    def __init__(self, delta, interface, messageId, message):
        self.delta = delta
        self.interface = interface
        self.messageId = messageId
        self.message = message

class Log:
    def __init__(self, filepath=None):
        self.entries = []
        if filepath is not None:
            self.readFile(filepath)

    def readFile(self, filepath):
        with open(filepath, 'r') as f:
            for line in f.readlines():
                entry = parseLogEntry(line)
                self.entries.append(entry)

    def validate(self):
        prev = None
        for entry in self.entries:
            elapsed = None
            if prev is not None:
                elapsed = entry.delta - prev.delta
                if (elapsed.days < 0 or elapsed.seconds < 0 or elapsed.microseconds < 0):
                    raise Exception('Negative elapsed time')
            prev = entry


    def frequencyBy(self, property):
        freq = {}
        for entry in self.entries:
            key = entry.__dict__[property]
            if entry.messageId in freq:
                freq[key] += 1
            else:
                freq[key] = 1
        return freq

    def summarize(self, topN=5):
        startTime, endTime = self.entries[0], self.entries[-1]
        elapsed = endTime.delta - startTime.delta
        freq = self.frequencyBy('messageId')
        top = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:topN]

        return {
            'elapsedSeconds': toSeconds(elapsed),
            'topMessageIds': top
        }