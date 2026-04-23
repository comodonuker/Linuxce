#pragma once
#include <vector>
#include <string>
#include <sys/types.h>

struct ProcessInfo {
    pid_t pid;
    std::string name;
    std::string cmdline;
};

std::vector<ProcessInfo> getRunningProcesses();
