import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useSupabaseData } from '../hooks/useSupabaseData';

interface TagUMKM {
  id: string;
  nama_tag: string;
  warna: string;
  created_at: string;
  updated_at: string;
}

const MasterTag: React.FC = () => {
  const [tags, setTags] = useState<TagUMKM[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagUMKM | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagUMKM | null>(null);
  const [formData, setFormData] = useState({
    nama_tag: '',
    warna: '#3B82F6'
  });

  const { toast } = useToast();
  const { 
    loading, 
    fetchTagUMKM, 
    addTagUMKM, 
    updateTagUMKM, 
    deleteTagUMKM 
  } = useSupabaseData();

  useEffect(() => {
    loadTags();
  }, [searchTerm]);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTagUMKM();
      
      const filteredData = searchTerm
        ? data?.filter(tag => 
            tag.nama_tag.toLowerCase().includes(searchTerm.toLowerCase())
          ) || []
        : data || [];
      
      setTags(filteredData);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        await updateTagUMKM(editingTag.id, {
          nama_tag: formData.nama_tag,
          warna: formData.warna,
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Berhasil",
          description: "Tag berhasil diperbarui",
        });
      } else {
        await addTagUMKM({
          nama_tag: formData.nama_tag,
          warna: formData.warna
        });
        
        toast({
          title: "Berhasil",
          description: "Tag berhasil ditambahkan",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan tag",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingTag) return;
    
    try {
      await deleteTagUMKM(deletingTag.id);
      
      toast({
        title: "Berhasil",
        description: "Tag berhasil dihapus",
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingTag(null);
      loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus tag",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingTag(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tag: TagUMKM) => {
    setEditingTag(tag);
    setFormData({
      nama_tag: tag.nama_tag,
      warna: tag.warna
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (tag: TagUMKM) => {
    setDeletingTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nama_tag: '',
      warna: '#3B82F6'
    });
    setEditingTag(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Master Tag UMKM</CardTitle>
          <CardDescription>
            Kelola tag untuk kategorisasi UMKM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tag
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Tag</TableHead>
                  <TableHead>Warna</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : tags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchTerm ? 'Tidak ada tag yang ditemukan' : 'Belum ada data tag'}
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">{tag.nama_tag}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: tag.warna }}
                          />
                          <span className="text-sm text-muted-foreground">{tag.warna}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: tag.warna, color: 'white' }}>
                          {tag.nama_tag}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(tag.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(tag)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(tag)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Tambah Tag Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingTag ? 'Perbarui informasi tag' : 'Masukkan informasi tag baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nama_tag">Nama Tag</Label>
                <Input
                  id="nama_tag"
                  name="nama_tag"
                  value={formData.nama_tag}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama tag"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="warna">Warna</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="warna"
                    name="warna"
                    type="color"
                    value={formData.warna}
                    onChange={handleInputChange}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.warna}
                    onChange={(e) => setFormData(prev => ({ ...prev, warna: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
                <div className="mt-2">
                  <Label className="text-sm text-muted-foreground">Preview:</Label>
                  <div className="mt-1">
                    <Badge style={{ backgroundColor: formData.warna, color: 'white' }}>
                      {formData.nama_tag || 'Nama Tag'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {editingTag ? 'Perbarui' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tag "{deletingTag?.nama_tag}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MasterTag;