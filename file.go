// Copyright 2021 Vitali Asheichyk
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE.txt file.

package file

import (
	"bufio"
	"os"

	"go.k6.io/k6/js/modules"
)

func init() {
	modules.Register("k6/x/file", new(FILE))
}

// FILE is the k6 extension
type FILE struct{}

// WriteString writes string to file
func (*FILE) WriteString(path string, s string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(s); err != nil {
		return err
	}
	return nil
}

func (*FILE) DirSizeMB(path string) (int64, error) {
	var size int64
    var mu sync.Mutex

    // Function to calculate size for a given path
    var calculateSize func(string) error
    calculateSize = func(p string) error {
        fileInfo, err := os.Lstat(p)
        if err != nil {
            return err
        }

        // Skip symbolic links to avoid counting them multiple times
        if fileInfo.Mode()&os.ModeSymlink != 0 {
            return nil
        }

        if fileInfo.IsDir() {
            entries, err := os.ReadDir(p)
            if err != nil {
                return err
            }
            for _, entry := range entries {
                if err := calculateSize(filepath.Join(p, entry.Name())); err != nil {
                    return err
                }
            }
        } else {
            mu.Lock()
            size += fileInfo.Size()
            mu.Unlock()
        }
        return nil
    }

    // Start calculation from the root path
    if err := calculateSize(path); err != nil {
        return 0, err
    }

    return size, nil
}

// AppendString appends string to file
func (*FILE) AppendString(path string, s string) error {
	f, err := os.OpenFile(path,
		os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(s); err != nil {
		return err
	}
	return nil
}

// WriteBytes writes binary file
func (*FILE) WriteBytes(path string, b []byte) error {
	err := os.WriteFile(path, b, 0o644)
	if err != nil {
		return err
	}
	return nil
}

// ClearFile removes all the contents of a file
func (*FILE) ClearFile(path string) error {
	f, err := os.OpenFile(path, os.O_RDWR, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()

	if err := f.Truncate(0); err != nil {
		return err
	}
	return nil
}

// RenameFile renames file from oldPath to newPath
func (FILE) RenameFile(oldPath string, newPath string) error {
	err := os.Rename(oldPath, newPath)
	if err != nil {
		return err
	}
	return nil
}

// DeleteFile deletes file
func (*FILE) DeleteFile(path string) error {
	err := os.Remove(path)
	if err != nil {
		return err
	}
	return nil
}

// RemoveRowsBetweenValues removes the rows from a file between start and end (inclusive)
func (*FILE) RemoveRowsBetweenValues(path string, start, end int) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	lines := make([]string, 0)
	lineCount := 0

	// Read the entire file into memory
	for scanner.Scan() {
		lineCount++
		if lineCount < start || lineCount > end {
			lines = append(lines, scanner.Text())
		}
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	// Write the modified contents back to the file
	f, err = os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()

	writer := bufio.NewWriter(f)
	for _, line := range lines {
		if _, err := writer.WriteString(line + "\n"); err != nil {
			return err
		}
	}

	if err := writer.Flush(); err != nil {
		return err
	}
	return nil
}
